# API de Monitoreo Ambiental

Servicio backend para almacenar, consultar y analizar mediciones ambientales
de estaciones de monitoreo: promedios, valores extremos y alertas por umbrales.

## Tecnologías

- NestJS + TypeScript
- PostgreSQL 16
- Prisma ORM
- Swagger / OpenAPI
- Docker y Docker Compose

## Ejecución rápida

Solo se necesita Docker.

```bash
git clone <url-del-repositorio>
cd sat-api
docker compose up --build
```

Al iniciar, el contenedor de la API crea las tablas, carga los datos sintéticos
y levanta el servidor.

- API: http://localhost:3000
- Documentación Swagger: http://localhost:3000/docs

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/analisis/estaciones` | Estaciones con su municipio |
| GET | `/analisis/promedios` | Promedio de las variables |
| GET | `/analisis/extremos` | Valores mínimos y máximos |
| GET | `/analisis/alertas` | Mediciones que superan los umbrales |

### Filtros (opcionales, en los endpoints de análisis)

| Parámetro | Ejemplo | Descripción |
|---|---|---|
| `fechaInicio` | `2026-10-01` | Fecha inicial (incluida) |
| `fechaFin` | `2026-10-15` | Fecha final (incluida) |
| `estacionId` | `4` | Id de la estación |
| `variable` | `temperatura` | `temperatura`, `humedad`, `pm25`, `precipitacion` o `ph` |

### Ejemplos

```
GET /analisis/promedios?estacionId=1
GET /analisis/extremos?variable=temperatura&fechaInicio=2026-10-01&fechaFin=2026-10-10
GET /analisis/alertas?variable=ph
```

## Umbrales de alerta

| Variable | Condición |
|---|---|
| Temperatura | > 35 °C |
| Humedad | > 95 % |
| PM2.5 | > 25 µg/m³ |
| Precipitación | > 50 mm |
| pH | < 6 o > 9 |

Los umbrales están centralizados en `src/analisis/umbrales.ts`.

## Modelo de datos

- **municipios**: `id`, `nombre`
- **estaciones**: `id`, `nombre`, `latitud`, `longitud`, `municipio_id`
- **mediciones**: `id`, `estacion_id`, `fecha`, `temperatura`, `humedad`, `pm25`, `precipitacion`, `ph`

Un municipio tiene varias estaciones y una estación tiene muchas mediciones.
La tabla de mediciones tiene un índice en (`estacion_id`, `fecha`), porque la
mayoría de consultas filtran por esos campos.

El esquema está en `prisma/schema.prisma` y la migración en `prisma/migrations/`.

## Datos sintéticos

El archivo `prisma/seed.sql` genera:

- 3 municipios de Caldas: Manizales, Villamaría y La Dorada
- 5 estaciones
- 100 mediciones por estación (500 en total), distribuidas en 30 días

Los valores siguen patrones realistas: ciclo de temperatura día/noche, clima
más cálido en La Dorada, lluvias ocasionales y algunos valores que generan
alertas. Usa una semilla fija (`setseed`), por lo que siempre genera los mismos datos.

## Desarrollo local (sin Docker para la API)

```bash
npm install
cp .env.example .env
docker compose up -d db
npx prisma migrate deploy
npx prisma db execute --file prisma/seed.sql --schema prisma/schema.prisma
npm run start:dev
```