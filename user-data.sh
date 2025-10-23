#!/bin/bash
# Script de inicialización para EC2

# Actualizar el sistema
yum update -y

# Instalar Docker
yum install docker -y
systemctl start docker
systemctl enable docker
usermod -a -G docker ec2-user

# Instalar Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Instalar Git
yum install git -y

# Crear directorio para la aplicación
mkdir -p /home/ec2-user/app
cd /home/ec2-user/app

# Clonar el repositorio (necesitarás configurar esto)
# Por ahora, crearemos la estructura básica

# Crear archivo .env
cat > .env << 'EOF'
DB_PASSWORD=postgres123
DB_NAME=students_db
DB_USERNAME=postgres
DB_HOST=db
EOF

# El usuario deberá subir los archivos del proyecto
echo "Sistema listo. Sube los archivos del proyecto a /home/ec2-user/app"
