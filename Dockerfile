### https://docs.astro.build/en/recipes/docker/#nginx

FROM node:lts AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Argumento para la URL del repositorio de documentación
ARG URL_REPO_DOCS
ENV URL_REPO_DOCS=$URL_REPO_DOCS

# Sincroniza la documentación y luego construye la aplicación
RUN npm run docs:sync
RUN npm run build

FROM nginx:alpine AS runtime
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080