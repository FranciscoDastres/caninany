# Roadmap de producto y mejora técnica

Estado de referencia: 14 de junio de 2026.

Este plan se basa en una revisión del frontend, backend, modelo de datos,
pruebas, contenedores y flujos visibles. El objetivo no es sumar pantallas
aisladas, sino completar primero el ciclo operativo de una reserva.

## Estado actual

### Funciona

- Landing comercial responsive con servicios, galería, opiniones y formulario.
- Calendario público con disponibilidad calculada por servicio y peso.
- Solicitudes públicas persistidas con protección contra solapamientos.
- Registro, login con JWT y rutas diferenciadas para clientes y
  administradores.
- Panel administrativo de usuarios y contenido principal de la portada.
- Perfil cliente con CRUD de mascotas y lectura de compras y comprobantes.
- PostgreSQL, Prisma, Docker Compose, migraciones y almacenamiento de imágenes.
- Lint, typecheck, build y 24 pruebas backend/contratos en estado correcto.
- Presupuesto automático para el bundle inicial del frontend.

### Parcial o desconectado

- Existe un endpoint seguro de reserva autenticada y un selector de mascotas,
  pero la interfaz de reserva todavía utiliza únicamente el flujo invitado.
- Las compras solo se pueden consultar; no existe flujo para crearlas o
  asociarlas a una cita.
- Los estados de una cita existen en la base de datos, pero no hay endpoints ni
  interfaz para confirmarla, completarla o cancelarla.
- El login entrega un access token de dos horas, sin refresh token, revocación
  ni cierre de sesión en servidor.
- El contenido editable cubre solo una parte de la portada.

## Riesgos que bloquean la operación real

1. Una solicitud pública queda `PENDING` y bloquea el horario, pero actualmente
   solo puede liberarse modificando directamente la base de datos.
2. El flujo visible de reserva no utiliza todavía las mascotas persistidas del
   cliente autenticado.
3. Los endpoints públicos no tienen rate limiting, límite de anticipación,
   horizonte máximo ni expiración de solicitudes pendientes.
4. El sitio anuncia atención de lunes a sábado, mientras el calendario backend
   abre todos los días, incluidos domingos.
5. Cambiar el rol de un usuario no invalida su JWT actual; un administrador
   degradado conserva permisos hasta que expire el token.
6. No existen pruebas de frontend, pruebas e2e ni pruebas de repositorios
   contra PostgreSQL real.

## Flujo objetivo

El recorrido principal debe quedar así:

1. La persona consulta servicios, precios, duración y políticas reales.
2. Inicia sesión o continúa como invitada, según la política comercial.
3. Crea o selecciona una mascota.
4. Selecciona servicio y horario disponible.
5. El servidor deriva propietario, peso, duración y precio desde datos
   confiables.
6. La reserva queda confirmada o pendiente con una expiración y próximos pasos
   explícitos.
7. Administración la gestiona desde una agenda.
8. El cliente puede verla, cancelarla o reagendarla según las reglas.
9. El sistema envía confirmaciones y recordatorios observables.

## Fase 0: Estabilizar la agenda actual

Objetivo: impedir bloqueos indefinidos, abuso de la agenda e inconsistencias de
horario antes de atraer más reservas.

- Definir el ciclo de estados: solicitada, confirmada, completada, cancelada,
  expirada y ausencia.
- Agregar `expiresAt`, motivo de cancelación y timestamps de transición.
- Crear endpoints administrativos para listar, ver y cambiar el estado de una
  solicitud.
- Crear una bandeja administrativa mínima de solicitudes pendientes.
- Liberar automáticamente solicitudes expiradas mediante un proceso
  idempotente.
- Definir anticipación mínima y horizonte máximo de reserva configurables.
- Implementar días laborables, fines de semana, pausas, feriados y bloqueos.
- Alinear el texto público con el calendario configurado.
- Aplicar rate limiting a login, registro, calendario y solicitudes públicas.
- Limitar intentos por IP y teléfono; evaluar CAPTCHA solo si el abuso lo exige.
- Reemplazar la apertura automática de WhatsApp por un botón explícito en la
  confirmación.
- Mostrar código, estado, vencimiento y próximos pasos en la confirmación.
- Añadir pruebas de estados, expiración, rate limiting y restricciones de
  calendario.

Criterio de terminado: una solicitud puede ser atendida, confirmada, cancelada
o expirada sin usar Prisma Studio ni SQL, y ningún visitante puede bloquear
indefinidamente la agenda.

## Fase 1: Clientes, mascotas y reserva autenticada

Objetivo: completar el flujo principal para un cliente registrado.

- [x] Crear contratos y esquemas compartidos para mascotas.
- [x] Implementar CRUD de mascotas con nombre, raza, peso, fecha de nacimiento,
      observaciones médicas básicas y comportamiento.
- [x] Aplicar autorización por propietario en cada operación.
- [x] Hacer que la reserva autenticada reciba solo `petId`, servicio, horario y
      notas.
- [x] Obtener propietario y peso desde la base de datos dentro del caso de uso.
- [x] Rechazar combinaciones de cliente y mascota que no correspondan.
- [x] Añadir administración de mascotas al perfil del cliente.
- [ ] Integrar el selector de mascotas al formulario autenticado.
- [ ] Permitir crear una mascota sin abandonar el flujo de reserva.
- [ ] Añadir al perfil próximas citas, historial y detalle de cada reserva.
- [ ] Permitir cancelación y reagendamiento según reglas configurables.
- [ ] Ofrecer asociación opcional de una solicitud invitada con una cuenta.
- [ ] Corregir los enlaces globales para que servicios y reserva funcionen desde
      cualquier ruta.
- [x] Añadir estados vacíos y mensajes de error a la gestión de mascotas.
- [ ] Cubrir registro, mascota, reserva, conflicto, cancelación y reagendamiento con
      pruebas de aplicación y e2e.

Criterio de terminado: una persona puede registrarse, crear una mascota,
reservar sin ingresar UUID ni peso manualmente y gestionar la cita desde su
perfil.

## Fase 2: Operación administrativa completa

Objetivo: que el negocio pueda operar el día a día desde la aplicación.

- Crear agenda diaria y semanal con filtros por estado, servicio y cliente.
- Mostrar detalle de contacto, mascota, notas, duración e historial de cambios.
- Confirmar, completar, cancelar, expirar y marcar ausencia.
- Crear reservas en nombre de clientes o invitados.
- Crear y editar clientes y mascotas para atención telefónica.
- Añadir búsqueda, paginación y filtros en usuarios y citas.
- Evitar eliminar o degradar al último administrador activo.
- Configurar servicios, precios, duración base y ajustes por tamaño.
- Configurar horarios, pausas, feriados y bloqueos desde el panel.
- Registrar auditoría de acciones administrativas.
- Incorporar empleados, boxes o recursos solo si habrá atención simultánea.
- Si existen recursos, asociarlos a las citas y cambiar la restricción de
  solapamiento para operar por recurso.

Criterio de terminado: administración puede gestionar una semana completa de
trabajo sin tocar la base de datos, Swagger ni variables de entorno.

## Fase 3: Sesiones, seguridad y confianza

Objetivo: proteger cuentas, datos personales y operaciones administrativas.

- Implementar refresh tokens rotatorios con almacenamiento `HttpOnly`,
  `Secure` y `SameSite`.
- Mantener access tokens de corta duración fuera de `localStorage`.
- Crear logout de servidor y revocación por dispositivo o sesión.
- Invalidar sesiones cuando cambie el rol, contraseña o estado de la cuenta.
- Consultar el usuario actual o usar una versión de sesión para operaciones
  sensibles.
- Implementar recuperación y cambio de contraseña.
- Añadir verificación de correo y protección contra enumeración de cuentas.
- Normalizar correos en una sola capa y aplicar unicidad sin distinguir
  mayúsculas.
- Revisar política de contraseña. `scrypt` es adecuado si sus parámetros se
  documentan y versionan; migrar a Argon2 no es requisito por sí mismo.
- Añadir consentimiento para comunicaciones y tratamiento de datos.
- Publicar privacidad, términos, política de cancelación y datos reales del
  negocio.
- Configurar CSP, HSTS, headers del frontend y secretos exclusivos por entorno.
- Validar que producción no pueda arrancar con secretos de desarrollo.
- Añadir pruebas de autorización horizontal, sesiones revocadas y cambios de
  rol.

Criterio de terminado: las sesiones se pueden renovar y revocar, los cambios de
permisos tienen efecto inmediato y los datos personales tienen políticas
explícitas.

## Fase 4: Compras, pagos y comprobantes

Objetivo: conectar la operación comercial con las citas.

- Decidir primero si el cobro será presencial, transferencia u online.
- Asociar cada compra a una cita y conservar el cliente responsable.
- Permitir que administración registre cobros, descuentos y medios de pago.
- Generar o adjuntar comprobantes con acceso autorizado.
- Mostrar pagos y comprobantes dentro del detalle de la cita.
- Evitar URLs públicas permanentes para documentos privados.
- Añadir estados de pago y conciliación.
- Integrar un proveedor de pago online solo después de estabilizar el flujo
  manual.
- Usar webhooks verificados e idempotentes si se habilitan pagos online.

Criterio de terminado: cada cobro tiene trazabilidad desde la cita hasta el
comprobante y solo las personas autorizadas pueden consultarlo.

## Fase 5: Comunicaciones

Objetivo: reducir ausencias y trabajo manual.

- Enviar confirmación al crear o confirmar una reserva.
- Enviar recordatorios configurables, inicialmente 24 horas antes.
- Notificar cancelaciones, expiraciones y reagendamientos.
- Crear plantillas versionadas para correo y WhatsApp.
- Ejecutar envíos en una cola con reintentos, idempotencia y dead-letter queue.
- Guardar estado, proveedor, intentos y error de cada comunicación.
- Respetar preferencias y consentimiento del cliente.
- Permitir reenvío manual desde administración.
- No registrar teléfonos, correos ni contenido sensible en logs abiertos.

Criterio de terminado: cada evento importante produce una comunicación
trazable y un fallo del proveedor no bloquea la reserva.

## Fase 6: Calidad, accesibilidad y observabilidad

Objetivo: detectar regresiones antes que clientes y facilitar soporte.

- Añadir pruebas unitarias de contratos compartidos.
- Añadir React Testing Library para formularios, sesión, rutas y estados.
- Añadir pruebas de repositorios con PostgreSQL real.
- Crear Playwright e2e para cliente, invitado y administrador.
- Cubrir concurrencia real al reservar el mismo bloque.
- Definir una cobertura mínima para dominio y aplicación.
- Incorporar logging estructurado, correlation ID y redacción de datos
  sensibles.
- Integrar monitoreo de errores y alertas.
- Añadir métricas de reservas, conflictos, expiraciones, latencia y errores.
- Separar healthcheck de proceso, readiness de base de datos y liveness.
- Corregir foco, navegación por teclado, modales, contraste y anuncios de
  estado.
- Mantener el presupuesto de bundle y medir Core Web Vitals.
- Probar restauración de base de datos y archivos, no solo creación de backups.

Criterio de terminado: los flujos críticos tienen pruebas automatizadas,
alertas y procedimientos de diagnóstico y recuperación.

## Fase 7: CI/CD, producción y crecimiento

Objetivo: desplegar cambios y operar el producto de forma repetible.

- Crear pipeline obligatorio de formato, lint, typecheck, tests, build y e2e.
- Validar migraciones en una base temporal.
- Escanear dependencias, secretos e imágenes Docker.
- Versionar imágenes y artefactos por commit.
- Crear ambiente de staging con datos no sensibles.
- Definir despliegue, migración, rollback y rollback de frontend.
- Usar PostgreSQL administrado con backups automáticos.
- Mover imágenes y comprobantes a almacenamiento de objetos.
- Configurar dominio, TLS, DNS, CORS y secretos administrados.
- Añadir dashboard operativo, alertas y runbook.
- Completar SEO técnico, metadatos sociales, sitemap y datos estructurados.
- Sustituir cifras y testimonios de demostración por contenido verificable.
- Añadir analítica con consentimiento y eventos del embudo de reserva.

Criterio de terminado: cada cambio aprobado puede llegar a staging y producción
mediante un proceso auditable, monitoreado y reversible.

## Orden de ejecución

1. Fase 0: estabilizar agenda y solicitudes.
2. Fase 1: mascotas y reserva autenticada.
3. Fase 2: operación administrativa.
4. Fase 3: sesiones y seguridad.
5. Fase 4: compras y pagos.
6. Fase 5: comunicaciones.
7. Fase 6: calidad y observabilidad.
8. Fase 7: producción y crecimiento.

Las medidas mínimas de seguridad, pruebas y observabilidad no deben esperar a
sus fases completas: cada fase debe incluir autorización, migraciones,
telemetría y pruebas proporcionales al riesgo.

## Regla para cada entrega

Una capacidad se considera terminada solo cuando incluye:

- migración y restricciones de base de datos cuando correspondan;
- contratos compartidos y validación de entrada;
- autorización en backend, no solo protección visual;
- interfaz con carga, error, vacío y éxito;
- pruebas del camino feliz y de los rechazos importantes;
- actualización de documentación y variables de entorno;
- verificación de lint, typecheck, tests, build y flujo e2e afectado.
