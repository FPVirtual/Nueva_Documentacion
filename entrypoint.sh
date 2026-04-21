#!/bin/sh
echo "=> Sincronizando y construyendo documentación de: $URL_REPO_DOCS"
npm run build

echo "=> Moviendo archivos estáticos para Nginx"
rm -rf /usr/share/nginx/html/*
cp -r /app/dist/* /usr/share/nginx/html/

echo "=> Iniciando Nginx..."
nginx -g "daemon off;"