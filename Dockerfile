### https://docs.astro.build/en/recipes/docker/#nginx

# Paso 1: Construir la aplicación con Node.js
FROM node:lts AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Argumento para la URL del repositorio de documentación
ARG URL_REPO_DOCS
ENV URL_REPO_DOCS=$URL_REPO_DOCS

# Argumentos para personalizar la instancia de docs
ARG LOGO_NAME
ENV LOGO_NAME=$LOGO_NAME

ARG STYLESHEET_NAME
ENV STYLESHEET_NAME=$STYLESHEET_NAME

ARG SITE_TITLE
ENV SITE_TITLE=$SITE_TITLE

# Construye la aplicación
RUN npm run build

# Paso 2: Copiar dist y servir la aplicación con Nginx
FROM nginx:alpine AS runtime
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080