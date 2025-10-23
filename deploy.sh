#!/bin/bash
# Script para desplegar la aplicación en EC2

EC2_IP="3.80.113.3"
EC2_USER="ec2-user"
KEY_PATH="$HOME/.ssh/jenkins-key.pem"  # Ajusta esta ruta según donde esté tu key

echo "Subiendo archivos a EC2..."

# Crear archivo .env si no existe
if [ ! -f .env ]; then
  cat > .env << 'EOF'
DB_PASSWORD=postgres123
DB_NAME=students_db
DB_USERNAME=postgres
DB_HOST=db
EOF
  echo "Archivo .env creado"
fi

# Copiar archivos al servidor
scp -i "$KEY_PATH" -r \
  docker-compose.yml \
  Dockerfile \
  .dockerignore \
  package.json \
  pnpm-lock.yaml \
  tsconfig.json \
  tsconfig.build.json \
  nest-cli.json \
  src \
  prometheus \
  grafana \
  .env \
  ${EC2_USER}@${EC2_IP}:/home/ec2-user/app/

echo "Conectando a EC2 para iniciar servicios..."

# Conectar y ejecutar docker-compose
ssh -i "$KEY_PATH" ${EC2_USER}@${EC2_IP} << 'ENDSSH'
cd /home/ec2-user/app
sudo docker-compose down 2>/dev/null || true
sudo docker-compose up -d --build
echo "Servicios iniciados!"
echo ""
echo "Accede a:"
echo "  - Aplicación NestJS: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000"
echo "  - Swagger API: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000/api"
echo "  - Prometheus: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):9090"
echo "  - Grafana: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3001"
echo "  - Grafana user: admin / password: admin123"
ENDSSH

echo ""
echo "Despliegue completado!"
