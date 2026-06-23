# Plan de identidad e intranets

Estado de referencia: 23 de junio de 2026.

Este documento es el orden vigente de implementación. La primera entrega es
identidad segura más intranet cliente; la ampliación administrativa empieza
cuando ese flujo esté cerrado.

## Entrega 1: identidad y sesiones

### 1A. Base de sesiones — completada

- Access tokens de 10 minutos mantenidos solo en memoria.
- Refresh tokens rotatorios de 30 días en cookie `HttpOnly`, `SameSite=Lax` y
  `Secure` en producción.
- Detección de reutilización del refresh token y revocación de su sesión.
- Renovación automática, bootstrap al recargar, logout actual/general y
  revocación por dispositivo.
- Validación de sesión y estado real del usuario en cada request autenticado.
- Revocación de todas las sesiones al cambiar el rol.
- Campos `User.status`, `emailVerifiedAt`, `phone`, `avatarUrl` y
  `passwordHash` opcional.
- Tablas `ExternalIdentity`, `AuthSession` y `AuthToken`; los usuarios
  preexistentes quedan verificados durante la migración.

Validación: migración aplicada en PostgreSQL 17, flujo HTTP con rotación y
revocación, flujo de navegador con recarga y logout, lint, typecheck, pruebas y
build.

### 1B. Correo local y protección de endpoints — completada

- Registro pendiente de verificación; token hasheado, de un uso y válido por
  24 horas.
- Reenvío de verificación sin enumerar cuentas.
- Recuperación de contraseña con token de 30 minutos y revocación de sesiones.
- Adaptador Resend y `MAIL_MODE=log|resend`.
- Rate limiting diferenciado para login, registro, refresh, verificación y
  recuperación.
- El cambio autenticado de contraseña se conectará a “Cuenta y seguridad” en
  la entrega de intranet cliente.

El rate limiting actual usa memoria de proceso, adecuado para la instancia
única actual. Antes de escalar horizontalmente debe moverse a un almacén
compartido.

### 1C. Google y métodos de acceso — completada

- Botón oficial Google Identity Services, sin One Tap.
- Verificación backend de firma, `aud`, `iss` y expiración mediante
  `google-auth-library`; `sub` será el único identificador estable.
- `GOOGLE_LINK_REQUIRED` cuando el correo ya pertenece a una cuenta local.
- Vinculación con contraseña y desvinculación sin eliminar el último método de
  acceso.
- Google solo crea cuentas cliente y nunca asigna permisos administrativos.
- El botón queda oculto si no existe configuración de Google.

La pantalla de “Cuenta y seguridad” consumirá la vinculación y desvinculación
ya disponibles cuando se construya el layout del portal cliente.

## Entrega 2: intranet cliente

- Layout autenticado independiente y rutas `/perfil/resumen`,
  `/perfil/citas`, `/perfil/mascotas`, `/perfil/compras` y `/perfil/cuenta`.
- Reserva autenticada con mascota guardada o alta inline; propietario, peso y
  duración derivados en backend.
- Próximas citas, historial, detalle y eventos con carga, error, vacío y
  paginación por cursor.
- Cancelación y reagendamiento propios hasta 24 horas antes; disponibilidad
  comprobada en transacción y regreso a `pending`.
- Edición de nombre/teléfono, contraseña, Google y sesiones activas.

Criterio: cliente → mascota → reserva → recarga de sesión → reagendamiento o
cancelación, cubierto por pruebas de aplicación, React Testing Library y E2E.

## Entrega 3: intranet administrativa

- Layout propio con resumen, agenda, clientes, usuarios y contenido.
- Estados `EXPIRED` y `NO_SHOW`, vencimiento pendiente a dos horas y
  `AppointmentEvent` como auditoría.
- Agenda diaria/semanal con filtros y operaciones administrativas completas.
- Alta de citas para clientes o invitados, sin límite de 24 horas, con motivo.
- Clientes paginados con mascotas, citas y compras.
- Protección del último administrador y revocación por cambio de rol/estado.

## Entrega 4: notificaciones y producción

- Correos de verificación, recuperación y ciclo completo de citas.
- Pruebas de rotación/reutilización, Google, autorización, expiración,
  transiciones, límite de 24 horas y conflictos concurrentes.
- E2E de cliente y administración.
- Migraciones contra PostgreSQL real, lint, typecheck, pruebas, build y
  presupuesto de bundle como controles obligatorios.

## Fuera del primer alcance

Precios, pagos, horarios configurables y recursos de atención quedan para una
fase posterior a agenda y clientes.
