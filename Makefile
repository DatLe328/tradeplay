.PHONY: help utils

help:
	@echo "Available commands:"
	@echo "  make dev              - Start dev environment"
	@echo "  make dev-down         - Stop dev environment"
	@echo "  make rebuild          - Rebuild specific service (e.g., make rebuild service=auth-service)"

dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d

dev-down:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml down

rebuild:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml build $(service)
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --no-deps $(service)