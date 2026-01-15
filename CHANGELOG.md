# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/).

---

## [1.0.0] - 2026-01-15

### Added

- Initial stable production release.
- Deployed on DigitalOcean using Cloudflare Tunnel.
- Production domain: `tiencotruong.com`.
- Docker-based production deployment on host server.
- Automatic deployment by pulling new Docker images from the development environment.
- User authentication and authorization system.
- User profile management (view and edit user information).
- Stable image upload functionality.

### Security

- JWT-based authentication with access and refresh tokens.
- Password hashing using bcrypt with salt.
- CSRF protection with HttpOnly and Secure cookies.
- Cloudflare Turnstile integration for login and registration.
- IP-based rate limiting for user and admin routes.
- Security headers and HTTPS enforcement.
