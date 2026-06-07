# ─────────────────────────────────────────
# Stage 1: Build
# ─────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG VITE_API_BASE_URL
ARG VITE_APP_NAME=CropShield
ARG VITE_APP_VERSION=1.0.0

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_APP_VERSION=$VITE_APP_VERSION

RUN npm run build

# ─────────────────────────────────────────
# Stage 2: Serve with Nginx
# ─────────────────────────────────────────
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]