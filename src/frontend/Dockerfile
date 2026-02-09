FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_API_URL
ARG VITE_APP_VERSION
ARG VITE_TURNSTILE_SITE_KEY
ARG VITE_UNDER_MAINTENANCE

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_APP_VERSION=${VITE_APP_VERSION}
ENV VITE_TURNSTILE_SITE_KEY=${VITE_TURNSTILE_SITE_KEY}
ENV VITE_UNDER_MAINTENANCE=${VITE_UNDER_MAINTENANCE}

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY server.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]