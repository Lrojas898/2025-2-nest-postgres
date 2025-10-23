# Monitoreo con Prometheus y Grafana

## Descripción

Este proyecto implementa un sistema de monitoreo para una aplicación NestJS desplegada en AWS EC2 utilizando Prometheus y Grafana.

### Prometheus

<img width="1907" height="1047" alt="image" src="https://github.com/user-attachments/assets/9b3391aa-1527-41ea-8137-a1d8c65681d0" />



Sistema de monitoreo y base de datos de series temporales (TSDB) que recolecta métricas de aplicaciones mediante HTTP pull. Almacena las métricas con marcas de tiempo y permite realizar consultas mediante PromQL (Prometheus Query Language).

### Grafana
<img width="1911" height="1037" alt="image" src="https://github.com/user-attachments/assets/e916841a-b933-40dd-a593-77da3aaf597f" />


<img width="1905" height="1040" alt="image" src="https://github.com/user-attachments/assets/37dde0a2-7158-43a1-b139-4c2ba19dfd5e" />


Plataforma de visualización y análisis de métricas que permite crear dashboards interactivos. Se conecta a fuentes de datos como Prometheus para visualizar métricas en tiempo real mediante gráficas, tablas y alertas.

---

## Arquitectura Implementada

```
┌─────────────────┐     HTTP GET      ┌──────────────┐
│  NestJS App     │ ←───────────────  │  Prometheus  │
│  (Port 3000)    │   /api/metrics    │  (Port 9090) │
│                 │                    │              │
│ - Expone        │                    │ - Recolecta  │
│   métricas en   │                    │   métricas   │
│   formato       │                    │   cada 15s   │
│   Prometheus    │                    │              │
└─────────────────┘                    └──────┬───────┘
                                              │
                                              │ PromQL
                                              │
                                       ┌──────▼───────┐
                                       │   Grafana    │
                                       │  (Port 3001) │
                                       │              │
                                       │ - Visualiza  │
                                       │   dashboards │
                                       └──────────────┘
```

---

<img width="1905" height="1033" alt="image" src="https://github.com/user-attachments/assets/addaa524-04e6-45fb-b18b-f9e2929b9ad7" />


## Configuración Realizada

### 1. Aplicación NestJS

#### Instalación de dependencias

```bash
npm install @willsoto/nestjs-prometheus prom-client
```

#### Configuración del módulo

Se agregó `PrometheusModule` en `src/app.module.ts`:

```typescript
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: {
        enabled: true,
      },
    }),
    // ... otros módulos
  ],
})
export class AppModule {}
```

Esto expone métricas en el endpoint `/api/metrics` (considerando el prefijo global `/api`).

### 2. Prometheus

#### Archivo de configuración: `prometheus/prometheus.yml`

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: "prometheus"
    static_configs:
      - targets: ["localhost:9090"]

  - job_name: "nestjs-app"
    static_configs:
      - targets: ["44.220.138.169:3000"]
    metrics_path: "/api/metrics"
```

- `scrape_interval`: Frecuencia de recolección de métricas
- `job_name`: Identificador del servicio monitoreado
- `targets`: Dirección del servicio
- `metrics_path`: Ruta del endpoint de métricas

### 3. Grafana

#### Datasource pre-configurado: `grafana/provisioning/datasources/prometheus.yml`

```yaml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
```

#### Dashboard creado

Se creó un dashboard con 4 paneles mediante la API de Grafana:

1. **CPU Usage**: `rate(process_cpu_seconds_total{job="nestjs-app"}[1m]) * 100`
2. **Memory Usage**: `process_resident_memory_bytes{job="nestjs-app"} / 1024 / 1024`
3. **Event Loop Lag**: `nodejs_eventloop_lag_seconds{job="nestjs-app"}`
4. **Heap Memory**: `nodejs_heap_size_used_bytes{job="nestjs-app"} / 1024 / 1024`

### 4. Docker Compose

Se utilizó Docker Compose para orquestar Prometheus y Grafana:

```yaml
services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin123
    volumes:
      - grafana-data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
```

---

## Despliegue en AWS

### Recursos creados

- **Instancia EC2**: t2.medium (Amazon Linux 2023)
- **IP Pública**: 44.220.138.169
- **Security Group**: Puertos abiertos 22, 3000, 3001, 9090
- **Key Pair**: nestjs-deploy-key

### Servicios desplegados

| Servicio | Puerto | URL |
|----------|--------|-----|
| NestJS API | 3000 | http://44.220.138.169:3000/api |
| Prometheus | 9090 | http://44.220.138.169:9090 |
| Grafana | 3001 | http://44.220.138.169:3001 |
| PostgreSQL | 5432 | localhost:5432 (interno) |

### Proceso de despliegue

1. Creación de instancia EC2 con user-data script para instalar Docker
2. Configuración de Security Group con reglas de entrada
3. Instalación de Node.js 18 y pnpm en la instancia
4. Copia de archivos del proyecto vía SCP
5. Instalación de dependencias y build de la aplicación
6. Despliegue de PostgreSQL con Docker Compose
7. Despliegue de Prometheus y Grafana con Docker Compose
8. Inicio de la aplicación NestJS con PM2
9. Configuración de Prometheus para apuntar a la aplicación
10. Creación de dashboard en Grafana vía API

---

## Métricas Recolectadas

### Métricas del proceso

- `process_cpu_user_seconds_total`: CPU en modo usuario
- `process_cpu_system_seconds_total`: CPU en modo sistema
- `process_resident_memory_bytes`: Memoria RAM utilizada
- `process_virtual_memory_bytes`: Memoria virtual
- `process_open_fds`: Descriptores de archivo abiertos

### Métricas de Node.js

- `nodejs_eventloop_lag_seconds`: Lag del event loop
- `nodejs_heap_size_total_bytes`: Tamaño total del heap
- `nodejs_heap_size_used_bytes`: Heap utilizado
- `nodejs_heap_space_size_total_bytes`: Espacios del heap
- `nodejs_version_info`: Información de versión

---

## Verificación

### Prometheus

Acceder a http://44.220.138.169:9090/targets para verificar que el target `nestjs-app` está en estado UP.


Ejecutar query en http://44.220.138.169:9090/graph:

```promql
process_resident_memory_bytes{job="nestjs-app"}
```

<img width="1918" height="1037" alt="image" src="https://github.com/user-attachments/assets/1d9efa96-4ef7-4f39-8673-a9b4283717f7" />


### Grafana

Acceder a http://44.220.138.169:3001 con credenciales:
- Usuario: `admin`
- Contraseña: `admin123`

<img width="1913" height="1033" alt="image" src="https://github.com/user-attachments/assets/a5dc0dcb-41e6-4cd4-85cb-83dacb652279" />


Dashboard en http://44.220.138.169:3001/d/aded1d20-041d-490c-9be4-82fbc8f05813/nestjs-application-monitoring

<img width="1912" height="1041" alt="image" src="https://github.com/user-attachments/assets/7fde862a-f521-4689-8617-f92296ef9f0f" />


### Métricas de la aplicación

Endpoint de métricas en formato Prometheus: http://44.220.138.169:3000/api/metrics
<img width="1908" height="1043" alt="image" src="https://github.com/user-attachments/assets/d38bfef9-6059-4b1d-b176-964d2d7c20ab" />



---

## Comandos Útiles

### Verificar estado de servicios

```bash
# Conectar a EC2
ssh -i ~/.ssh/nestjs-deploy-key.pem ec2-user@44.220.138.169

# Ver contenedores Docker
sudo docker ps

# Ver logs de Prometheus
sudo docker logs prometheus

# Ver logs de Grafana
sudo docker logs grafana

# Ver estado de la aplicación NestJS
pm2 status
pm2 logs nestjs-app
```

### Reiniciar servicios

```bash
# Reiniciar Prometheus
sudo docker-compose -f docker-compose-monitoring.yml restart prometheus

# Reiniciar Grafana
sudo docker-compose -f docker-compose-monitoring.yml restart grafana

# Reiniciar aplicación NestJS
pm2 restart nestjs-app
```

### Generar tráfico para métricas

```bash
# Poblar base de datos
curl http://44.220.138.169:3000/api/seed

# Generar peticiones
for i in {1..100}; do
  curl http://44.220.138.169:3000/api/students
done
```

---

## Archivos de Configuración

```
proyecto/
├── prometheus/
│   └── prometheus.yml          # Configuración de scraping
├── grafana/
│   └── provisioning/
│       └── datasources/
│           └── prometheus.yml  # Datasource pre-configurado
├── docker-compose-monitoring.yml  # Orquestación de servicios
├── docker-compose-db.yml          # PostgreSQL
├── .env                           # Variables de entorno
└── src/
    └── app.module.ts              # Configuración de PrometheusModule
```

---

## Referencias

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [@willsoto/nestjs-prometheus](https://github.com/willsoto/nestjs-prometheus)
- [prom-client](https://github.com/siimon/prom-client)
