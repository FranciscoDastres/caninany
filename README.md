# Caninany

Monorepo full-stack para agendar servicios veterinarios de baño y limpieza de
oídos. La base usa React, Vite, Tailwind CSS, Shadcn, NestJS, Prisma,
PostgreSQL, pnpm workspaces, Turborepo y Docker.

El avance funcional está organizado en [docs/roadmap.md](docs/roadmap.md).

## Estructura

```text
caninany/
├── apps/
│   ├── backend/
│   │   ├── prisma/
│   │   │   ├── migrations/
│   │   │   │   └── 20260612000000_init/
│   │   │   │       └── migration.sql
│   │   │   └── schema.prisma
│   │   ├── src/
│   │   │   ├── application/
│   │   │   │   ├── ports/
│   │   │   │   │   ├── business-calendar.port.ts
│   │   │   │   │   ├── clock.port.ts
│   │   │   │   │   └── id-generator.port.ts
│   │   │   │   └── use-cases/
│   │   │   │       ├── create-appointment.use-case.ts
│   │   │   │       └── get-available-slots.use-case.ts
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── appointment.entity.ts
│   │   │   │   ├── errors/
│   │   │   │   ├── repositories/
│   │   │   │   ├── services/
│   │   │   │   └── value-objects/
│   │   │   ├── generated/
│   │   │   │   └── prisma/
│   │   │   ├── infrastructure/
│   │   │   │   ├── auth/
│   │   │   │   ├── config/
│   │   │   │   ├── database/
│   │   │   │   │   └── prisma/
│   │   │   │   │       └── repositories/
│   │   │   │   ├── http/
│   │   │   │   │   ├── controllers/
│   │   │   │   │   └── pipes/
│   │   │   │   ├── ids/
│   │   │   │   └── time/
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── test/
│   │   │   └── domain/
│   │   ├── Dockerfile
│   │   ├── nest-cli.json
│   │   ├── package.json
│   │   ├── prisma.config.ts
│   │   ├── tsconfig.build.json
│   │   └── tsconfig.json
│   └── frontend/
│       ├── public/
│       ├── src/
│       │   ├── app/
│       │   │   ├── app.tsx
│       │   │   ├── providers.tsx
│       │   │   ├── root-layout.tsx
│       │   │   └── router.tsx
│       │   ├── components/
│       │   │   ├── layout/
│       │   │   └── ui/
│       │   ├── context/
│       │   ├── core/
│       │   │   ├── api/
│       │   │   ├── auth/
│       │   │   └── dates/
│       │   ├── features/
│       │   │   ├── admin-dashboard/
│       │   │   │   └── components/
│       │   │   ├── appointments/
│       │   │   │   ├── api/
│       │   │   │   ├── components/
│       │   │   │   ├── hooks/
│       │   │   │   └── pages/
│       │   │   └── pets/
│       │   │       ├── api/
│       │   │       ├── components/
│       │   │       └── hooks/
│       │   ├── lib/
│       │   ├── store/
│       │   ├── main.tsx
│       │   └── styles.css
│       ├── components.json
│       ├── Dockerfile
│       ├── index.html
│       ├── nginx.conf
│       ├── package.json
│       └── vite.config.ts
├── packages/
│   └── shared/
│       ├── src/
│       │   ├── constants/
│       │   ├── contracts/
│       │   ├── schemas/
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
├── .env.example
├── docker-compose.yml
├── eslint.config.mjs
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── turbo.json
```

## Responsabilidades

- `apps/backend/src/domain`: modelo de negocio puro. Contiene entidades,
  reglas de peso y duración, detección de choques e interfaces de repositorio.
  No conoce HTTP, NestJS ni PostgreSQL.
- `apps/backend/src/application`: casos de uso y puertos necesarios para
  orquestar el dominio. No instancia infraestructura.
- `apps/backend/src/infrastructure`: adaptadores concretos para Prisma,
  PostgreSQL, HTTP, configuración, JWT, roles, reloj e IDs.
- `apps/frontend/src/components/ui`: componentes atómicos instalados o
  adaptados desde Shadcn. No contienen reglas del negocio.
- `apps/frontend/src/features`: módulos verticales. Cada capacidad conserva
  juntos sus componentes, hooks, páginas y acceso a API.
- `apps/frontend/src/core`: dependencias transversales como Axios, guardias de
  rutas y fechas.
- `apps/frontend/src/store` y `context`: estado global de sesión y providers de
  UI. El estado remoto se administra con React Query.
- `packages/shared`: contratos TypeScript, constantes y esquemas Zod usados en
  ambos lados. No contiene persistencia ni lógica de orquestación.

## Decisiones relevantes

- NestJS se usa como composition root y framework HTTP, pero los casos de uso
  y el dominio son clases TypeScript independientes.
- Prisma 7 genera el cliente dentro de `src/generated/prisma`; esa salida no
  se versiona y se crea antes de desarrollar, compilar o validar tipos.
- La migración inicial agrega una restricción PostgreSQL `EXCLUDE` para evitar
  citas activas solapadas incluso bajo concurrencia.
- El calendario de negocio convierte horarios locales con `Intl` y una zona
  IANA configurable, evitando offsets UTC fijos durante cambios de horario.
- `docker-compose.yml` ejecuta migraciones antes de iniciar el backend y monta
  el repositorio para hot reload.
- El formulario y el controlador consumen el mismo esquema Zod, evitando
  divergencia entre validación de cliente y servidor.
- Los JWT incluyen `userId`, correo, nombre y rol (`cliente` o `admin`). El
  frontend usa `PrivateRoute` para navegación, pero la autorización efectiva
  siempre se ejecuta en NestJS mediante `JwtAuthGuard` y `RolesGuard`.
- Las contraseñas se almacenan con `scrypt` y salt aleatorio. Nunca se
  persisten ni se registran en texto plano.
- Las imágenes editables se guardan en un volumen persistente y PostgreSQL
  conserva únicamente su URL.

## Desarrollo local

### Requisito: Docker nativo en WSL

El proyecto está pensado para ejecutarse desde la distro WSL, usando el socket
local de Linux (`/var/run/docker.sock`). Si `docker version` no responde dentro
de WSL, instala y arranca Docker Engine en Ubuntu:

```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-v2
sudo systemctl enable --now docker || sudo service docker start
sudo usermod -aG docker "$USER"
newgrp docker
```

Verifica que el CLI apunte al engine de WSL y no a Docker Desktop:

```bash
which docker
docker version
docker compose version
ls -l /var/run/docker.sock
```

`which docker` debe resolver a un binario local de Ubuntu y `docker version`
debe mostrar cliente y servidor. Si vuelve a aparecer una ruta bajo
`/mnt/wsl/docker-desktop`, desactiva la integración de Docker Desktop para esta
distro o cierra Docker Desktop antes de abrir WSL.

### Opción recomendada: un solo comando

Desde WSL, entra a la raíz del repositorio:

```bash
cd /home/dnthdev/proyectos/caninany
npm run dev
```

Este comando construye y levanta PostgreSQL, backend y frontend con hot reload.
La terminal queda mostrando los logs. Para detener todo, presiona `Ctrl+C`.

Comandos operativos:

```bash
# Levantar en segundo plano
npm run dev:up

# Ver logs
npm run dev:logs

# Ver estado
npm run dev:status

# Abrir vista interactiva en lazydocker
npm run dev:ui

# Detener los servicios
npm run dev:down
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:3000/api/v1`
- Swagger: `http://localhost:3000/api/docs`
- PostgreSQL: `localhost:5432`

No necesitas ejecutar comandos separados dentro de `apps/frontend` y
`apps/backend`. Los scripts se ejecutan siempre desde la raíz del monorepo.

### Administrador inicial

Configura estas variables en `.env` antes del primer arranque:

```dotenv
ADMIN_NAME=Administración Caninany
ADMIN_EMAIL=admin@caninany.cl
ADMIN_PASSWORD=una-clave-segura-de-al-menos-12-caracteres
```

El backend crea la cuenta solo cuando el correo todavía no existe. El registro
público siempre crea usuarios con rol `cliente`.

### Rutas de autenticación y RBAC

- `POST /api/v1/auth/register`: registro de clientes.
- `POST /api/v1/auth/login`: entrega JWT y usuario autenticado.
- `GET /api/v1/auth/me`: perfil asociado al token.
- `GET /api/v1/pets`: mascotas activas del cliente autenticado.
- `POST /api/v1/pets`: crea una mascota para el cliente autenticado.
- `PUT /api/v1/pets/:id`: actualiza una mascota propia.
- `DELETE /api/v1/pets/:id`: archiva una mascota sin borrar su historial.
- `GET /api/v1/compras/mis-compras`: compras del cliente autenticado.
- `GET /api/v1/usuarios`: listado exclusivo para administradores.
- `PATCH /api/v1/usuarios/:id/rol`: cambio de rol exclusivo para
  administradores.
- `GET /api/v1/configuracion-sitio`: contenido público de la portada.
- `PUT /api/v1/configuracion-sitio`: edición exclusiva para administradores.
- `POST /api/v1/configuracion-sitio/imagenes`: carga de JPG, PNG o WebP
  exclusiva para administradores.

Rutas React:

- `/`: portada comercial con servicios, experiencia, galería, opiniones y
  acceso a reserva.
- `/nosotros`: propósito y forma de trabajo de Caninany.
- `/agendar`: agenda pública y solicitud de hora.
- `/ingresar` y `/registro`.
- `/perfil`: panel protegido para clientes.
- `/admin`: gestión de usuarios y contenido, protegida para administradores.

### Opción sin Docker para Node

Si quieres ejecutar frontend y backend directamente en WSL, manteniendo solo
PostgreSQL por separado:

```bash
cp .env.example .env
corepack enable
corepack prepare pnpm@10.32.1 --activate
pnpm install
pnpm db:generate
npm run dev:workspace
```

## Verificación

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
docker compose config
```
