FROM node:lts

# Instalar Nginx y Git para servir los archivos estáticos y clonar el repositorio
RUN apt-get update && \
    apt-get install -y nginx git && \
    rm -rf /var/lib/apt/lists/*

# Configurar el directorio de la aplicación
WORKDIR /app
COPY package*.json ./
RUN npm install

# Copiar el código fuente y Nginx conf
COPY . .
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

# Script de entrada para construir los docs al iniciar el contenedor y luego arrancar Nginx
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh
EXPOSE 80

# Al levantar el contenedor se ejecutará el build y luego Nginx
ENTRYPOINT ["/app/entrypoint.sh"]