package middleware

import (
	"fmt"
	"net"
	"net/http"
	"sort"
	"strings"
	"sync"
	"time"
	"tradeplay/common"

	sctx "tradeplay/components/service-context"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"golang.org/x/time/rate"
)

// TODO: Sharding for better performance under high load

var rateLimitScript = redis.NewScript(`
	local current = redis.call("INCR", KEYS[1])
	if tonumber(current) == 1 or redis.call("TTL", KEYS[1]) == -1 then
		redis.call("EXPIRE", KEYS[1], ARGV[1])
	end
	return current
`)

type ipEntry struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

type IPRateLimiter struct {
	ips        map[string]*ipEntry
	mu         *sync.RWMutex
	r          rate.Limit
	b          int
	maxEntries int
}

func NewIPRateLimiter(r rate.Limit, b int) *IPRateLimiter {
	i := &IPRateLimiter{
		ips:        make(map[string]*ipEntry),
		mu:         &sync.RWMutex{},
		r:          r,
		b:          b,
		maxEntries: 50000,
	}

	go func() {
		ticker := time.NewTicker(30 * time.Second)
		defer ticker.Stop()

		for range ticker.C {
			i.cleanup()
		}
	}()

	return i
}

func (i *IPRateLimiter) cleanup() {
	i.mu.Lock()
	defer i.mu.Unlock()

	now := time.Now()
	for ip, entry := range i.ips {
		if now.Sub(entry.lastSeen) > 3*time.Minute {
			delete(i.ips, ip)
		}
	}
}

func (i *IPRateLimiter) evictOldestEntries(count int) {
	type oldestEntry struct {
		ip   string
		time time.Time
	}

	var oldest []oldestEntry
	for ip, entry := range i.ips {
		if time.Since(entry.lastSeen) > 3*time.Minute {
			oldest = append(oldest, oldestEntry{ip: ip, time: entry.lastSeen})
		}
	}

	if len(oldest) == 0 {
		for ip, entry := range i.ips {
			oldest = append(oldest, oldestEntry{ip: ip, time: entry.lastSeen})
		}
	}

	sort.Slice(oldest, func(a, b int) bool {
		return oldest[a].time.Before(oldest[b].time)
	})

	for j := 0; j < count && j < len(oldest); j++ {
		delete(i.ips, oldest[j].ip)
	}
}

func (i *IPRateLimiter) GetLimiter(ip string) *rate.Limiter {
	i.mu.Lock()
	defer i.mu.Unlock()

	entry, exists := i.ips[ip]
	if !exists {
		if len(i.ips) >= i.maxEntries {
			i.evictOldestEntries(10)
		}

		if len(i.ips) < i.maxEntries {
			entry = &ipEntry{
				limiter:  rate.NewLimiter(i.r, i.b),
				lastSeen: time.Now(),
			}
			i.ips[ip] = entry
		} else {
			return rate.NewLimiter(i.r, i.b)
		}
	} else {
		entry.lastSeen = time.Now()
	}

	return entry.limiter
}

func getRealIP(c *gin.Context) string {
	if ip := c.GetHeader("CF-Connecting-IP"); ip != "" {
		if net.ParseIP(ip) != nil {
			return ip
		}
	}

	if xff := c.GetHeader("X-Forwarded-For"); xff != "" {
		ips := strings.Split(xff, ",")
		if len(ips) > 0 {
			ip := strings.TrimSpace(ips[0])
			if net.ParseIP(ip) != nil {
				return ip
			}
		}
	}

	if ip := c.GetHeader("X-Real-IP"); ip != "" {
		if net.ParseIP(ip) != nil {
			return ip
		}
	}

	return c.ClientIP()
}

func getUserID(c *gin.Context) string {
	if v, ok := c.Get(common.KeyRequester); ok {
		if r, ok := v.(common.Requester); ok {
			uid, _ := common.FromBase58(r.GetSubject())
			return uid.String()
		}
	}
	return "guest"
}

func RateLimitMiddleware(serviceCtx sctx.ServiceContext, limitPerWindow int, windowSec int) gin.HandlerFunc {
	redisComp := serviceCtx.MustGet(common.KeyCompRedis).(common.RedisComponent)
	rdb := redisComp.GetClient()

	return func(c *gin.Context) {
		userID := getUserID(c)
		ip := getRealIP(c)

		key := ""
		if userID == "guest" {
			action := c.FullPath()
			key = fmt.Sprintf("rate_limit:%s:%s", action, ip)
		} else {
			key = fmt.Sprintf("rate_limit:%s:%s", userID, ip)
		}
		ctx := c.Request.Context()

		res, err := rateLimitScript.Run(ctx, rdb, []string{key}, windowSec).Result()

		if err != nil {
			c.Next()
			return
		}

		count := res.(int64)

		if count > int64(limitPerWindow) {
			c.Header("Retry-After", fmt.Sprintf("%d", windowSec))
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"code":    429,
				"message": "Too many requests. Please slow down.",
			})
			return
		}

		c.Next()
	}
}
