FROM node:24-alpine AS builder

WORKDIR /app

COPY src/frontend/package*.json ./
RUN npm install

COPY src/frontend .

ARG VITE_API_URL
ARG VITE_APP_VERSION
ARG VITE_TURNSTILE_SITE_KEY
ARG VITE_UNDER_MAINTENANCE

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_VERSION=$VITE_APP_VERSION
ENV VITE_TURNSTILE_SITE_KEY=$VITE_TURNSTILE_SITE_KEY
ENV VITE_UNDER_MAINTENANCE=$VITE_UNDER_MAINTENANCE

RUN npm run build

FROM nginx:alpine

RUN touch /tmp/nginx.pid && \
    chown -R nginx:nginx /tmp/nginx.pid && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

USER nginx

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]