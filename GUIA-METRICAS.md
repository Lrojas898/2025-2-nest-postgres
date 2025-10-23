# Guía: Cómo Ver Métricas en Prometheus y Grafana

## 🔍 Ver Métricas en Prometheus

### 1. Acceder a Prometheus
Abre tu navegador y ve a: **http://44.220.138.169:9090**

### 2. Verificar que NestJS está siendo monitoreado
1. En la barra superior, haz clic en **"Status"** → **"Targets"**
2. Deberías ver dos targets:
   - `prometheus` (localhost:9090) - Estado: UP
   - `nestjs-app` (44.220.138.169:3000) - Estado: UP ✅

### 3. Consultar métricas de la aplicación
En la página principal de Prometheus:

#### Métricas disponibles de NestJS:
- `process_cpu_user_seconds_total` - Uso de CPU del proceso
- `process_resident_memory_bytes` - Memoria RAM utilizada
- `nodejs_eventloop_lag_seconds` - Lag del event loop de Node.js
- `nodejs_heap_size_total_bytes` - Tamaño total del heap
- `nodejs_heap_size_used_bytes` - Heap usado
- `http_requests_total` - Total de peticiones HTTP

#### Ejemplo de consultas:

**Ver uso de memoria:**
```promql
process_resident_memory_bytes{job="nestjs-app"}
```

**Ver uso de CPU:**
```promql
rate(process_cpu_seconds_total{job="nestjs-app"}[1m])
```

**Ver lag del event loop:**
```promql
nodejs_eventloop_lag_seconds{job="nestjs-app"}
```

### 4. Crear gráficas
1. Escribe la consulta en el campo de texto
2. Haz clic en **"Execute"**
3. Cambia a la pestaña **"Graph"** para ver la gráfica en el tiempo

---

## 📊 Configurar Dashboard en Grafana

### 1. Acceder a Grafana
Abre tu navegador y ve a: **http://44.220.138.169:3001**

**Credenciales:**
- Usuario: `admin`
- Contraseña: `admin123`

### 2. Verificar que Prometheus está conectado
1. En el menú lateral izquierdo, haz clic en **⚙️ Configuration** → **Data Sources**
2. Deberías ver **"Prometheus"** configurado
3. El datasource ya está pre-configurado para apuntar a `http://prometheus:9090`

### 3. Crear tu primer Dashboard

#### Opción A: Importar un dashboard pre-hecho de Node.js

1. En el menú lateral, haz clic en **"+"** → **"Import"**
2. Introduce el ID del dashboard: `11159` (Node.js Application Dashboard)
3. Haz clic en **"Load"**
4. En **"Prometheus"**, selecciona tu datasource de Prometheus
5. Haz clic en **"Import"**

¡Listo! Verás un dashboard completo con métricas de tu aplicación NestJS.

#### Opción B: Crear un dashboard personalizado desde cero

1. En el menú lateral, haz clic en **"+"** → **"Dashboard"**
2. Haz clic en **"Add new panel"**

**Panel 1: Uso de Memoria**
- Query: `process_resident_memory_bytes{job="nestjs-app"} / 1024 / 1024`
- Title: "Memoria RAM (MB)"
- Unit: megabytes

**Panel 2: Uso de CPU**
- Query: `rate(process_cpu_seconds_total{job="nestjs-app"}[1m]) * 100`
- Title: "Uso de CPU (%)"
- Unit: percent (0-100)

**Panel 3: Event Loop Lag**
- Query: `nodejs_eventloop_lag_seconds{job="nestjs-app"}`
- Title: "Node.js Event Loop Lag"
- Unit: seconds

**Panel 4: Heap Memory Usage**
- Query: `nodejs_heap_size_used_bytes{job="nestjs-app"} / 1024 / 1024`
- Title: "Heap Memory Used (MB)"
- Unit: megabytes

3. Haz clic en **"Apply"** para cada panel
4. Haz clic en el ícono de **💾 guardar** (arriba a la derecha)
5. Dale un nombre a tu dashboard (ej: "NestJS Monitoring")
6. Haz clic en **"Save"**

### 4. Personalizar el Dashboard

- **Cambiar período de tiempo:** Usa el selector de tiempo en la esquina superior derecha
- **Auto-refresh:** Configura el auto-refresh para que se actualice automáticamente
- **Agregar alertas:** Puedes configurar alertas para cuando las métricas excedan ciertos límites

---

## 🧪 Generar Tráfico para Ver Métricas

Para ver datos en los dashboards, necesitas generar tráfico a tu aplicación:

### Opción 1: Usando curl

```bash
# Poblar la base de datos
curl http://44.220.138.169:3000/api/seed

# Listar estudiantes (varias veces)
for i in {1..50}; do curl http://44.220.138.169:3000/api/students; done

# Ver las métricas directamente
curl http://44.220.138.169:3000/api/metrics
```

### Opción 2: Usando Swagger UI

1. Ve a http://44.220.138.169:3000/api
2. Prueba los diferentes endpoints desde la interfaz de Swagger
3. Esto generará tráfico y verás las métricas aumentar

---

## 📈 Métricas Importantes a Monitorear

### Performance:
- **CPU Usage**: Debe estar < 80% en condiciones normales
- **Memory Usage**: Monitorea que no crezca indefinidamente (memory leaks)
- **Event Loop Lag**: Debe estar cerca de 0. Si es > 100ms hay problemas

### Aplicación:
- **HTTP Requests**: Total de peticiones procesadas
- **Response Time**: Tiempo de respuesta de la aplicación
- **Active Connections**: Conexiones activas a la base de datos

### Sistema:
- **Open File Descriptors**: No debe acercarse al máximo
- **Heap Memory**: Monitorea el uso del heap de V8

---

## 🎯 Próximos Pasos

1. **Configurar Alertas**: Crea alertas en Grafana para ser notificado cuando las métricas excedan límites
2. **Agregar más métricas**: Instala más exporters para PostgreSQL, Docker, etc.
3. **Dashboard de negocio**: Crea métricas personalizadas en tu código para trackear eventos de negocio
4. **Persistencia**: Asegúrate de que los datos de Prometheus y Grafana se persistan en volúmenes

---

## 🔗 Enlaces Útiles

- **Prometheus**: http://44.220.138.169:9090
- **Grafana**: http://44.220.138.169:3001
- **API NestJS**: http://44.220.138.169:3000/api
- **Métricas Raw**: http://44.220.138.169:3000/api/metrics

**Documentación:**
- [Prometheus Query Language](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Grafana Dashboards](https://grafana.com/docs/grafana/latest/dashboards/)
- [Node.js Metrics](https://github.com/siimon/prom-client)
