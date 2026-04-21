#!/bin/sh
set -e
echo "===> [entrypoint] Sincronizando y construyendo documentación de: $URL_REPO_DOCS"
npm run build

echo "===> [entrypoint] Moviendo archivos estáticos para Nginx"
rm -rf /usr/share/nginx/html/*
cp -r /app/dist/* /usr/share/nginx/html/

echo "===> [entrypoint] Iniciando Nginx..."
exec nginx -g "daemon off;"