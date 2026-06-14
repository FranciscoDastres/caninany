# Rendimiento de Caninany

Auditoría realizada el 14 de junio de 2026 sobre el build de producción.

## Resultados frontend

| Métrica                           |     Antes |   Después | Cambio |
| --------------------------------- | --------: | --------: | -----: |
| JavaScript inicial minificado     | 559,06 kB | 355,35 kB | -36,4% |
| JavaScript inicial gzip           | 172,48 kB | 112,19 kB | -35,0% |
| CSS inicial                       |  44,90 kB |  43,67 kB |  -2,7% |
| Módulos transformados             |     1.969 |     1.919 |  -2,5% |
| DOMContentLoaded local indicativo |  1.681 ms |    509 ms | -69,7% |

La medición de `DOMContentLoaded` se tomó en Firefox contra `vite preview`.
Es orientativa y depende del equipo, caché y red. El tamaño del build es la
métrica reproducible principal.

La carga inicial ya no descarga administración, autenticación, perfil ni el
formulario de reserva. El formulario se solicita cuando la sección queda a
800 px del viewport. Al entrar directamente a `/agendar`, se reutiliza el mismo
chunk.

El presupuesto automático se ejecuta con:

```bash
pnpm performance:check
```

Falla si la suma del entrypoint y sus `modulepreload` supera 120 KiB gzip o si
el formulario vuelve a precargarse.

## Cambios de frontend

- Rutas secundarias cargadas mediante `lazy` de React Router.
- Formulario bajo el fold cargado con `IntersectionObserver` y `Suspense`.
- Axios sustituido por un cliente `fetch` pequeño con JWT, timeout y errores
  tipados.
- Secciones fuera del viewport usan `content-visibility: auto`.
- Formatters `Intl.DateTimeFormat` reutilizados por zona horaria.
- Imagen LCP marcada con prioridad alta.
- Dependencias y componentes sin consumidores eliminados.

## Complejidad del calendario

Definiciones:

- `A`: cantidad de citas activas del mes.
- `D`: días del mes.
- `S`: bloques horarios posibles por día.

Antes, cada día volvía a filtrar todas las citas y cada bloque buscaba
conflictos recorriendo las citas del día:

```text
O(D * A + S * A)
```

Ahora PostgreSQL devuelve sólo periodos ocupados ordenados, se agrupan una vez
por fecha y un cursor avanza linealmente por los periodos:

```text
O(A + D * S)
```

Además:

- Los días pasados retornan sin generar bloques.
- Los inicios vencidos del día actual no se serializan.
- La consulta de calendario selecciona únicamente `startsAt` y `endsAt`.
- La comprobación previa de conflicto usa `findFirst` y selecciona sólo `id`.
- La restricción `EXCLUDE` de PostgreSQL continúa resolviendo la concurrencia
  definitiva.

## Cambios de backend

- Los formatters de zona horaria se construyen una vez por instancia.
- La configuración pública usa caché en memoria de 60 segundos y coalescencia
  de lecturas concurrentes.
- El endpoint público envía `Cache-Control` con `stale-while-revalidate`.
- La actualización de rol pasó de dos consultas a una.
- Listados de usuarios, compras y configuración seleccionan sólo columnas
  necesarias.
- Las respuestas mayores a 1 KiB se comprimen.
- Swagger no genera el documento en producción, reduciendo arranque y memoria.

## Verificación

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm performance:check
```

Para medir TTFB con PostgreSQL y Docker disponibles:

```bash
for i in $(seq 1 50); do
  curl -sS -o /dev/null \
    -w '%{time_starttransfer}\n' \
    'http://localhost:3000/api/v1/appointments/calendar?month=2026-07&service=bath&petWeightKg=8'
done
```
