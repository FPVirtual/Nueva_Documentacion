#!/bin/bash

# Salir inmediatamente si un comando falla
set -e

echo "Iniciando despliegue de Astro Starlight..."

# Descargar los últimos cambios del repositorio
git pull origin main

# Reconstruir la imagen de Docker y levantar el servicio
docker compose up -d --build

# Limpiar imágenes huérfanas antiguas para no llenar el disco
docker image prune -f

echo "¡Despliegue completado con éxito!"