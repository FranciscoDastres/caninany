# Roadmap de producto

Estado de referencia: 13 de junio de 2026.

## Fase 0: Fundación técnica

Objetivo: disponer de una base reproducible para desarrollar y desplegar.

- [x] Monorepo con pnpm workspaces y Turborepo.
- [x] Backend NestJS con dominio, aplicación e infraestructura desacoplados.
- [x] Frontend React por features con Tailwind CSS y base Shadcn.
- [x] Contratos y validaciones compartidos con Zod.
- [x] PostgreSQL y Prisma con migraciones.
- [x] Docker Compose con hot reload y healthchecks.
- [x] Dockerfiles de desarrollo y producción.
- [x] Restricción PostgreSQL contra horarios solapados.
- [x] Calendario configurable con zona `America/Santiago` y soporte DST.
- [x] Typecheck, lint, tests, build y Prisma validate.
- [x] Verificación real de contenedores de desarrollo y producción.

Resultado: completada.

## Fase 1: Identidad, clientes y mascotas

Objetivo: que una persona pueda registrarse, iniciar sesión y administrar sus
mascotas sin introducir UUIDs manualmente.

- [x] Implementar registro de clientes.
- [ ] Implementar login con access token y refresh token rotatorio.
- [ ] Hashear contraseñas con Argon2.
- [ ] Implementar logout y revocación de sesiones.
- [x] Crear endpoint `GET /auth/me`.
- [ ] Implementar CRUD de mascotas.
- [ ] Validar que cada cliente solo acceda a sus propias mascotas.
- [x] Añadir usuario administrador inicial mediante configuración segura.
- [x] Crear pantallas de registro, login y perfil.
- [ ] Sustituir UUIDs del formulario por la sesión y un selector de mascotas.
- [ ] Añadir pruebas unitarias, integración y e2e del flujo.

Criterio de terminado: un cliente nuevo puede registrarse, iniciar sesión,
crear una mascota y verla en su cuenta.

## Fase 2: Reserva completa de horas

Objetivo: permitir una reserva real, segura y comprensible.

- [x] Consultar disponibilidad desde el formulario.
- [x] Usar calendario y selector visual de bloques horarios.
- [x] Crear solicitudes públicas persistidas sin exponer datos personales en
      la disponibilidad.
- [ ] Obtener peso y propiedad desde la mascota persistida.
- [x] Ignorar `customerId` enviado por el cliente y usar la identidad JWT.
- [ ] Verificar propiedad de la mascota dentro del caso de uso.
- [ ] Crear página de confirmación y resumen de reserva.
- [ ] Listar próximas citas e historial del cliente.
- [ ] Permitir cancelar y reagendar según políticas configurables.
- [ ] Definir anticipación mínima, máximo de días y días no laborables.
- [ ] Añadir feriados, bloqueos manuales y pausas.
- [x] Traducir conflictos concurrentes de PostgreSQL a HTTP `409`.
- [ ] Añadir pruebas e2e de reserva, conflicto, cancelación y reagendamiento.

Criterio de terminado: un cliente autenticado selecciona su mascota, elige un
horario disponible y gestiona su reserva sin datos técnicos.

## Fase 3: Operación administrativa

Objetivo: administrar la agenda diaria y las reglas del negocio.

- [ ] Dashboard con agenda diaria, semanal y filtros.
- [ ] Confirmar, completar, cancelar y marcar ausencia.
- [ ] CRUD de clientes y mascotas para atención telefónica.
- [ ] Crear reservas en nombre de un cliente.
- [ ] Configurar servicios, duración base, precio y reglas por peso.
- [ ] Configurar horario laboral, pausas, feriados y bloqueos.
- [ ] Incorporar empleados, boxes o recursos si existe atención simultánea.
- [ ] Asociar cada cita a un recurso y ajustar la restricción anti-solapamiento.
- [ ] Añadir métricas básicas: reservas, cancelaciones y ocupación.
- [ ] Registrar auditoría de cambios administrativos.

Criterio de terminado: administración puede operar la agenda sin modificar la
base de datos ni usar Swagger.

## Fase 4: Comunicaciones

Objetivo: reducir olvidos y trabajo manual.

- [ ] Correo de confirmación.
- [ ] Recordatorio 24 horas antes.
- [ ] Notificación de cancelación o reagendamiento.
- [ ] Plantillas configurables.
- [ ] Cola de trabajos con reintentos y dead-letter handling.
- [ ] Integración opcional con WhatsApp.
- [ ] Preferencias y consentimiento de comunicación.

Criterio de terminado: las comunicaciones se envían de forma asíncrona,
observable e idempotente.

## Fase 5: Calidad, seguridad y observabilidad

Objetivo: preparar el sistema para uso real.

- [ ] Rate limiting en autenticación y endpoints públicos.
- [ ] Cookies `HttpOnly` o almacenamiento seguro de refresh tokens.
- [ ] Recuperación y cambio de contraseña.
- [ ] Verificación de correo.
- [ ] Logging estructurado con correlation ID.
- [ ] Métricas, tracing y monitoreo de errores.
- [ ] Healthchecks de disponibilidad y dependencia de base de datos.
- [ ] Tests de repositorios con PostgreSQL real.
- [ ] Cobertura mínima acordada para dominio y aplicación.
- [ ] Playwright para los flujos críticos.
- [ ] Revisión de accesibilidad y navegación por teclado.
- [ ] Política de respaldo y restauración probada.

Criterio de terminado: los riesgos principales tienen prevención, detección y
procedimientos de recuperación.

## Fase 6: CI/CD y producción

Objetivo: desplegar con seguridad y repetibilidad.

- [ ] Pipeline de lint, typecheck, tests y build.
- [ ] Escaneo de dependencias, secretos e imágenes.
- [ ] Registro versionado de imágenes Docker.
- [ ] Entorno staging con migraciones automáticas controladas.
- [ ] Estrategia de rollback.
- [ ] Gestión de secretos fuera del repositorio.
- [ ] Dominio, TLS, CORS y headers para producción.
- [ ] PostgreSQL administrado y backups automáticos.
- [ ] Despliegue productivo del frontend y API.
- [ ] Alertas, dashboard operativo y runbook.

Criterio de terminado: cada cambio aprobado puede llegar a producción mediante
un pipeline auditable y reversible.

## Orden recomendado

1. Fase 1: identidad y mascotas.
2. Fase 2: reserva completa.
3. Fase 3: operación administrativa.
4. Fase 5: seguridad y observabilidad mínima.
5. Fase 4: comunicaciones.
6. Fase 6: despliegue productivo.

Las partes críticas de Fase 5 deben incorporarse progresivamente desde Fase 1,
especialmente autorización, pruebas y manejo seguro de sesiones.
