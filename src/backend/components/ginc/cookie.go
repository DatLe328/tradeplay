package ginc

import (
	"os"
	"strings"
)

// GetCookieDomainForOrigin resolves the cookie domain from the request Origin header.
// Returns an empty string for localhost or unrecognised origins.
func GetCookieDomainForOrigin(originURL string) string {
	var originDomain string
	if strings.Contains(originURL, "://") {
		parts := strings.Split(originURL, "://")
		if len(parts) > 1 {
			domain := parts[1]
			if strings.Contains(domain, ":") {
				domain = strings.Split(domain, ":")[0]
			}
			originDomain = domain
		}
	}

	if originDomain == "" || originDomain == "localhost" || originDomain == "127.0.0.1" {
		return ""
	}

	domainsEnv := os.Getenv("COOKIE_DOMAINS")
	if domainsEnv == "" {
		domainsEnv = "tadeldev.site"
	}
	allowedRoots := strings.Split(domainsEnv, ",")

	for _, root := range allowedRoots {
		root = strings.TrimSpace(root)
		if originDomain == root || strings.HasSuffix(originDomain, "."+root) {
			return "." + root
		}
	}

	return ""
}
