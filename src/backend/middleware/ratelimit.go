package middleware

import (
	"net"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

// TODO: Sharding for better performance under high load

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

func (i *IPRateLimiter) GetLimiter(ip string) *rate.Limiter {
	i.mu.Lock()
	defer i.mu.Unlock()

	entry, exists := i.ips[ip]
	if !exists {
		if len(i.ips) >= i.maxEntries {
			itemsToRemove := i.maxEntries / 4
			count := 0
			for k := range i.ips {
				delete(i.ips, k)
				count++
				if count >= itemsToRemove {
					break
				}
			}
		}

		entry = &ipEntry{
			limiter:  rate.NewLimiter(i.r, i.b),
			lastSeen: time.Now(),
		}
		i.ips[ip] = entry
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

func RateLimitMiddleware(limitPerSec int, burst int) gin.HandlerFunc {
	limiter := NewIPRateLimiter(rate.Limit(limitPerSec), burst)

	return func(c *gin.Context) {
		ip := getRealIP(c)
		l := limiter.GetLimiter(ip)

		if !l.Allow() {
			c.Header("Retry-After", "1")

			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"code":    429,
				"message": "Too many requests. Please slow down.",
			})
			return
		}

		c.Next()
	}
}
