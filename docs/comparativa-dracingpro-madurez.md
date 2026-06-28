# Comparativa de madurez con DRacingPro

Fecha de revision: 2026-06-27.

Objetivo: usar DRacingPro como referencia de madurez para Caninany sin copiar el
dominio automotriz. La comparacion se enfoca en citas, Google/autenticacion,
paneles, runtime, pruebas y operacion diaria.

## Evidencia verificada

Caninany:

- Docker Compose estaba levantado con backend, frontend y PostgreSQL healthy.
- `GET /api/v1/health` respondio 200.
- `GET /api/v1/configuracion-sitio` respondio 200.
- La SPA en `http://localhost:5173/` respondio 200.
- `GET /api/v1/usuarios` sin sesion respondio 401.
- La base local tenia exactamente un usuario `ADMIN` activo con password hash
  `scrypt`.
- Pasaron `corepack pnpm lint`, `corepack pnpm typecheck`,
  `corepack pnpm test`, `corepack pnpm build` y
  `corepack pnpm performance:check`.
- El bundle inicial quedo en `111.6 KiB gzip` contra limite `120 KiB`.
- La suite frontend no tiene archivos de test; Vitest pasa por
  `--passWithNoTests`.

DRacingPro:

- Docker Compose estaba levantado con backend, frontend y PostgreSQL healthy.
- `GET /health/ready` respondio 200 con `database: ok`.
- `GET /v1/services` respondio 200.
- La SPA en `http://127.0.0.1:5176/` respondio 200.
- `GET /v1/admin/users` sin sesion respondio 401.
- La base local tenia exactamente un admin activo con password hash `scrypt`.
- Pasaron `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build`.
- La suite tiene 73 tests backend y 11 tests frontend.

## Diferencia central

Caninany ya tiene buena base de identidad, sesiones, Google Identity Services,
mascotas, agenda publica y contenido editable.

DRacingPro esta mas maduro en el ciclo operativo completo: el cliente entra con
Google, reserva desde una intranet, la cita queda en estados operables, se puede
cancelar o reagendar, el administrador gestiona agenda y clientes, hay metricas,
pagos, boletas, historial, timeline y pruebas frontend/backend que cubren esos
flujos.

## Citas

### DRacingPro

- Citas autenticadas por cliente.
- Servicios multiples por cita, precio snapshot y duracion total.
- Disponibilidad calculada desde `business_hours`, `service_bays`,
  `schedule_exceptions` y citas activas.
- Estados amplios: `pending_payment`, `requested`, `confirmed`, `checked_in`,
  `in_service`, `ready`, `completed`, `cancelled`, `no_show`.
- Transiciones explicitas y validadas por backend.
- Historial de estado en `appointment_status_history`.
- Cancelacion y reagendamiento por cliente.
- Vista admin con filtros por fecha/estado.
- Reasignacion de bahia/recurso.
- Timeline visible para el cliente.
- Updates publicados por admin.
- Bloqueo de concurrencia con transaccion serializable y advisory lock.
- Integracion con pago: una cita puede quedar reservada como
  `pending_payment` mientras se completa Flow.

### Caninany

- Solicitud publica de hora con datos de contacto y mascota.
- Cita autenticada con `petId`, servicio, horario y notas.
- Validacion de propietario de mascota.
- Duracion calculada por servicio y peso.
- Validacion de horario laboral y bloque alineado.
- Prevencion de solapamiento activo.
- Estados basicos: `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`.
- No hay endpoints admin para listar y operar agenda completa.
- No hay cancelacion/reagendamiento de cliente.
- No hay historial de transiciones.
- No hay detalle/timeline de cita para cliente.
- No hay horarios/excepciones configurables desde admin.
- No hay recurso/capacidad configurable comparable a `service_bays`.
- No hay pago ni hold de pago conectado a cita.

### Brechas para igualar nivel

1. Crear ciclo de vida de cita completo:
   `REQUESTED/PENDING`, `CONFIRMED`, `IN_PROGRESS`, `READY`, `COMPLETED`,
   `CANCELLED`, `NO_SHOW`.
2. Agregar tabla de historial de estado con actor, motivo y fecha.
3. Agregar endpoints admin para agenda:
   listar por rango/estado, confirmar, cancelar, completar, marcar no-show.
4. Agregar cancelacion y reagendamiento por cliente con reglas de tiempo.
5. Agregar detalle de cita y timeline para cliente.
6. Agregar configuracion de horario y cierres especiales.
7. Agregar capacidad/recurso operativo si Caninany puede atender mas de una
   mascota por bloque.
8. Usar transacciones con aislamiento y/o lock explicito en creacion y
   reagendamiento para cerrar carreras reales bajo concurrencia.
9. Conectar compras/comprobantes al detalle de cita.

## Google y autenticacion

### DRacingPro

- Usa OAuth 2.0/OIDC Authorization Code + PKCE.
- El frontend redirige a `GET /v1/auth/google?returnTo=...`.
- Backend genera `state`, `nonce`, `code_verifier` y `code_challenge`.
- Callback backend valida state, nonce, code y tokens con `openid-client`.
- Sesion BFF por cookie `HttpOnly`.
- Clientes entran con Google.
- Admin entra con usuario local y password.
- Existe fallback dev-login solo en desarrollo.
- La cuenta Google nunca crea admins.
- El admin unico esta reforzado por indice unico parcial en PostgreSQL.

### Caninany

- Usa Google Identity Services button en frontend.
- El frontend recibe `credential` y lo envia a `POST /api/v1/auth/google`.
- Backend verifica ID token con `google-auth-library`.
- Usa `sub` como identidad estable y exige `email_verified`.
- Si el correo existe como cuenta local, devuelve `GOOGLE_LINK_REQUIRED`.
- Linkea Google con password local.
- Mantiene access token en memoria y refresh token rotatorio en cookie
  `HttpOnly`.
- Tiene verificacion de correo, recuperacion de password, sesiones activas,
  logout actual/general y revocacion de sesion.
- Google crea clientes y no admins.
- Falta pantalla real de "Cuenta y seguridad" para administrar Google,
  password y sesiones desde el portal.

### Brechas para igualar nivel

Caninany no esta peor en seguridad base; esta en otro modelo. GIS button +
verificacion backend del ID token es valido para el contrato actual. La brecha
con DRacingPro esta en producto y operacion:

1. Conectar "Cuenta y seguridad" en frontend:
   sesiones activas, logout global, vincular/desvincular Google, cambio de
   password y datos personales.
2. Probar el flujo Google con credenciales reales en entorno local/staging.
3. Agregar tests frontend de login local, Google no configurado, error
   `GOOGLE_LINK_REQUIRED` y redireccion por rol.
4. Agregar proteccion de mutaciones sensibles por `Origin`/CSRF equivalente al
   patron de DRacingPro.
5. Agregar constraint de admin unico en DB y bloquear degradar/suspender al
   ultimo admin.
6. Decidir si se mantiene GIS button o se migra a OAuth Code + PKCE. No es
   obligatorio migrar si el alcance es login simple, pero OAuth Code + PKCE es
   mejor si despues se necesitan permisos adicionales como Calendar.

## Panel cliente

### DRacingPro

- `/app` es una intranet con shell dedicado.
- Dashboard con estado actual, proxima cita, recomendaciones y acciones rapidas.
- Agenda autenticada con lista de proximas citas e historial.
- Detalle/timeline de cita.
- Historial de atenciones.
- Boletas y descargas.

### Caninany

- `/perfil` administra mascotas y compras.
- No muestra proxima cita, historial, detalle ni timeline.
- La reserva autenticada existe en backend, pero el formulario publico no esta
  completamente integrado con selector de mascota autenticado.

### Brechas

1. Convertir `/perfil` en portal cliente con navegacion interna.
2. Agregar dashboard cliente.
3. Integrar selector/creacion de mascota dentro del flujo de reserva.
4. Listar proximas citas, historial y detalle.
5. Mostrar compras/comprobantes relacionados a citas.
6. Exponer cuenta y seguridad.

## Panel admin

### DRacingPro

- Dashboard con metricas.
- Agenda admin con confirmacion/cancelacion/avance.
- Gestion de usuarios con soft delete, activar/desactivar y protecciones.
- Gestion de servicios.
- Configuracion de horarios y excepciones.
- Auditoria de acciones sensibles.

### Caninany

- Admin muestra usuarios y editor de contenido publico.
- Puede cambiar roles, pero falta proteccion fuerte de ultimo admin y admin
  unico por base de datos.
- No opera agenda desde el panel.
- No hay metricas.
- No hay auditoria.

### Brechas

1. Dashboard admin operativo.
2. Bandeja de solicitudes pendientes.
3. Agenda diaria/semanal con filtros.
4. Cambios de estado y motivos.
5. Gestion de usuarios con suspension, reactivacion, revocacion y proteccion
   del admin principal.
6. Gestion de servicios/precios/duraciones si se quiere vender o cobrar por
   atencion.
7. Auditoria.

## Pagos, compras y comprobantes

DRacingPro tiene pago Flow, settings de pago, webhook verificado, estados de
pago, invoices, PDF y seguridad documentada.

Caninany tiene `Purchase` y "mis compras", pero no esta conectado a cita ni a
un flujo de cobro.

Orden recomendado para Caninany:

1. Primero registrar cobros internos/manuales por cita.
2. Luego generar comprobantes internos.
3. Despues agregar proveedor online si el negocio lo necesita.
4. Si hay proveedor online, usar webhook verificado e idempotente.

## Pruebas y validacion

Caninany necesita subir al nivel de DRacingPro sobre todo en frontend y flujos
end-to-end:

1. Tests React para login/registro/Google.
2. Tests React para agenda publica y autenticada.
3. Tests React para perfil, mascotas, compras y admin.
4. Tests backend para transiciones de cita y reglas admin.
5. E2E Playwright:
   invitado solicita hora, cliente agenda/reagenda/cancela, admin confirma y
   completa.
6. Smoke Docker para health, auth, rutas protegidas y DB.

## Roadmap priorizado

### Fase 1: citas operables

- Agregar historial de estado de citas.
- Agregar endpoints admin para listar y cambiar estado.
- Agregar cancelacion/reagendamiento cliente.
- Agregar detalle de cita para cliente.
- Agregar tests backend de transiciones y conflictos.

### Fase 2: portal cliente y Google visible

- Convertir `/perfil` en portal cliente con dashboard.
- Integrar reserva autenticada con mascotas.
- Agregar "Cuenta y seguridad".
- Agregar UI para sesiones activas y Google link/unlink.
- Agregar tests frontend de auth y portal.

### Fase 3: admin operativo

- Crear dashboard admin con metricas basicas.
- Crear bandeja de solicitudes pendientes.
- Crear agenda admin diaria/semanal.
- Proteger admin unico y ultimo admin.
- Agregar auditoria.

### Fase 4: cobros/comprobantes

- Conectar compras a citas.
- Agregar cobros manuales.
- Agregar comprobante por cita.
- Evaluar pago online solo despues de estabilizar operacion.

### Fase 5: produccion

- Compose production-like con migraciones separadas.
- Healthcheck frontend.
- CI con lint/typecheck/test/build/e2e.
- Staging, secretos, backup, runbook y rollback.
