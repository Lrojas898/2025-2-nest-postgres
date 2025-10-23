# Despliegue de Prometheus y Grafana en AWS EC2

## Información del Despliegue

### Instancia EC2
- **IP Pública**: `44.220.138.169`
- **Tipo de Instancia**: t2.medium
- **Región**: us-east-1
- **AMI**: Amazon Linux 2
- **Key Pair**: nestjs-deploy-key

### Servicios Desplegados

#### Prometheus
- **URL**: http://44.220.138.169:9090
- **Puerto**: 9090
- **Estado**: ✅ Funcionando
- **Descripción**: Sistema de monitoreo y base de datos de series temporales

#### Grafana
- **URL**: http://44.220.138.169:3001
- **Dashboard NestJS**: http://44.220.138.169:3001/d/aded1d20-041d-490c-9be4-82fbc8f05813/nestjs-application-monitoring
- **Puerto**: 3001 (mapeado al puerto 3000 del contenedor)
- **Usuario**: `admin`
- **Contraseña**: `admin123`
- **Estado**: ✅ Funcionando con dashboard pre-configurado
- **Descripción**: Plataforma de visualización y dashboards

## Cómo Acceder

### Prometheus
1. Abre tu navegador
2. Visita: http://44.220.138.169:9090
3. Puedes explorar métricas en la interfaz web

### Grafana
1. Abre tu navegador
2. Visita: http://44.220.138.169:3001
3. Inicia sesión con:
   - Usuario: `admin`
   - Contraseña: `admin123`
4. El datasource de Prometheus ya está pre-configurado

## Configuración de Prometheus

Prometheus está configurado para recolectar métricas de:
- Sí mismo (localhost:9090)
- Aplicación NestJS (cuando esté desplegada en app:3000)

Archivo de configuración: `prometheus/prometheus.yml`

## Configuración de Grafana

Grafana viene con:
- Datasource de Prometheus pre-configurado
- Puerto mapeado a 3001 para evitar conflictos
- Autenticación configurada

## Conexión SSH a la Instancia

Para conectarte a la instancia EC2:

```bash
ssh -i ~/.ssh/nestjs-deploy-key.pem ec2-user@44.220.138.169
```

## Comandos Útiles

### Ver logs de los contenedores
```bash
ssh -i ~/.ssh/nestjs-deploy-key.pem ec2-user@44.220.138.169
cd /home/ec2-user/app
sudo docker-compose -f docker-compose-monitoring.yml logs -f
```

### Ver estado de los contenedores
```bash
sudo docker ps
```

### Reiniciar los servicios
```bash
cd /home/ec2-user/app
sudo docker-compose -f docker-compose-monitoring.yml restart
```

### Detener los servicios
```bash
cd /home/ec2-user/app
sudo docker-compose -f docker-compose-monitoring.yml down
```

## Aplicación NestJS

La aplicación NestJS también está desplegada y corriendo:

- **URL API**: http://44.220.138.169:3000/api
- **Swagger Docs**: http://44.220.138.169:3000/api
- **Métricas**: http://44.220.138.169:3000/api/metrics
- **Estado**: ✅ Funcionando y exponiendo métricas a Prometheus

### Endpoints disponibles:
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Login
- `GET /api/auth/private` - Endpoint protegido (requiere JWT)
- `GET /api/students` - Listar estudiantes
- `POST /api/students` - Crear estudiante
- `GET /api/seed` - Poblar base de datos con datos de prueba
- `GET /api/metrics` - Métricas de Prometheus

## Recursos AWS Creados

- **Instancia EC2**: i-0caaf23578d3abbcf
- **Security Group**: sg-0e0a89369800fc59c (default) con puertos:
  - 22 (SSH)
  - 3000 (NestJS - para uso futuro)
  - 3001 (Grafana)
  - 9090 (Prometheus)
- **Key Pair**: nestjs-deploy-key (guardado en ~/.ssh/nestjs-deploy-key.pem)
- **Volúmenes Docker**:
  - prometheus-data
  - grafana-data

## Notas Importantes

1. La instancia EC2 está corriendo y generando costos en AWS
2. Para detener la instancia y evitar costos:
   ```bash
   aws ec2 stop-instances --instance-ids i-0caaf23578d3abbcf
   ```
3. Para eliminar completamente los recursos:
   ```bash
   aws ec2 terminate-instances --instance-ids i-0caaf23578d3abbcf
   aws ec2 delete-key-pair --key-name nestjs-deploy-key
   ```
4. Los Security Group creados anteriormente también se pueden eliminar si no se necesitan:
   ```bash
   aws ec2 delete-security-group --group-id sg-0c523e9c84844e2a5
   ```
