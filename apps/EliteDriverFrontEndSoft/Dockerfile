FROM node:22-alpine AS build
WORKDIR /app

ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Versión del release, inyectada por docker-compose. Se muestra en el panel de
# administración para confirmar que el servidor sirve este build y no uno viejo.
ARG VITE_APP_VERSION=desconocida
ENV VITE_APP_VERSION=$VITE_APP_VERSION

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm test && npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
