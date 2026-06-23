# Prompt maestro: migración visual y estructural de Caninany

Copia desde la línea **“INICIO DEL PROMPT”** hasta **“FIN DEL PROMPT”** y úsalo en una nueva sesión dentro de la raíz del repositorio.

---

## INICIO DEL PROMPT

Actúa como diseñador de producto senior y desarrollador frontend senior. Debes rediseñar y ejecutar una migración visual completa del sitio **Caninany**, trabajando directamente sobre el repositorio existente, sin convertir el proyecto en otro negocio y sin romper ninguna funcionalidad actual.

### 1. Contexto del proyecto

El repositorio es un monorepo ubicado en `/home/dnthdev/proyectos/caninany`:

- Frontend: React 19, TypeScript, Vite 8, Tailwind CSS 4, React Router 7, Lucide React, React Query, Zustand, React Hook Form y Zod.
- Backend: NestJS, Prisma y PostgreSQL.
- Contratos compartidos: `packages/shared`.
- El producto permite mostrar los servicios de Caninany, solicitar/agendar horas, registrar e iniciar sesión, administrar mascotas, consultar compras y gestionar contenido/usuarios desde administración.
- Servicios actuales que deben conservarse: **baño completo**, **limpieza externa de oídos** y la combinación **baño + limpieza de oídos**.
- No agregues farmacia, tienda, despacho, carrito, buscador de productos ni servicios veterinarios que Caninany no ofrece.
- No reemplaces reglas de negocio, contratos, autenticación, agenda, disponibilidad, validaciones ni llamadas a la API por mocks.

Archivos iniciales relevantes:

- `apps/frontend/src/features/marketing/pages/home-page.tsx`
- `apps/frontend/src/components/layout/app-shell.tsx`
- `apps/frontend/src/features/marketing/components/gallery-section.tsx`
- `apps/frontend/src/styles.css`
- `apps/frontend/src/app/router.tsx`
- `apps/frontend/src/features/appointments/**`
- `apps/frontend/src/features/auth/**`
- `apps/frontend/src/features/client-profile/**`
- `apps/frontend/src/features/admin-dashboard/**`
- `packages/shared/src/schemas/site-configuration.schema.ts`
- `packages/shared/src/contracts/site-configuration.contract.ts`

Antes de editar, inspecciona el código, el estado de Git, los recursos disponibles en `apps/frontend/public`, el comportamiento de todas las rutas y la configuración editable. Conserva cambios ajenos que ya existan en el worktree.

### 2. Referencia visual y límite de originalidad

Usa como referencia estructural y de jerarquía la página:

`https://petvet.cl/pages/nosotros`

La referencia sirve para estudiar estos patrones generales:

- franja informativa superior;
- cabecera clara, amplia y profesional;
- navegación principal y secundaria bien jerarquizadas;
- fotografía protagonista de ancho completo;
- declaraciones de propósito en franjas de color;
- contenido organizado en bloques simples con iconos lineales;
- fila de señales de confianza;
- sección humana/equipo apoyada por fotografía;
- franja de contacto previa al footer;
- footer amplio, ordenado por columnas y con datos de contacto/sociales;
- uso disciplinado de espacios, alineaciones, contraste y tipografía.

No copies el diseño literalmente. Está prohibido reutilizar o reproducir:

- logotipo, nombre, fotografías, iconos propios, textos, estadísticas, nombres del equipo, testimonios o datos comerciales de Petvet;
- sus composiciones exactas; la paleta morado/amarillo sí puede utilizarse como
  decisión cromática, pero aplicada a una identidad y contenido propios;
- su HTML, CSS, theme de Shopify, código JavaScript, assets, dimensiones exactas o composición pixel por pixel;
- funciones de e-commerce que no existen en Caninany.

El resultado debe ser inequívocamente Caninany: misma lógica comercial y contenido verdadero, pero con una presentación más editorial, ordenada, sólida y profesional. Toma patrones de arquitectura visual, no una identidad ajena.

### 3. Objetivo del rediseño

Construye una experiencia visual coherente en todas las rutas públicas y privadas. La portada debe comunicar en menos de cinco segundos:

1. qué hace Caninany;
2. para quién es;
3. cuáles son sus dos servicios;
4. por qué la atención es distinta;
5. cómo reservar.

El nuevo diseño debe sentirse:

- profesional, cercano y confiable;
- especializado en bienestar e higiene canina;
- fotográfico y editorial, no como una plantilla SaaS;
- limpio, con bordes y sombras moderadas;
- cálido sin volverse infantil;
- consistente en escritorio, tablet y móvil.

### 4. Sistema visual propio de Caninany

Usa la paleta morado/amarillo solicitada para Caninany y conviértela en tokens semánticos. No disperses colores hexadecimales arbitrarios por cada componente. Puedes ajustar tonos después de comprobar contraste, pero parte de esta dirección:

- `brand-primary`: `#8F6291` — acciones principales, navegación y elementos de marca;
- `brand-deep`: `#744776` — títulos sobre fondos claros, hero y footer;
- `brand-bright`: `#B167B6` — franjas superiores, CTA y acentos;
- `brand-yellow`: `#FFC63D` — propósito, confianza y detalles de alto contraste;
- `brand-sand`: `#F5F3F5` — fondo neutro principal;
- `brand-cream`: `#FFFFFF` — superficies claras;
- `brand-soft`: `#F0E8F1` — bloques suaves y estados informativos;
- `ink`: `#231F24` y `muted`: `#6B646D` para cuerpo de texto;
- blanco para superficies y contraste.

Implementa los tokens en `styles.css` usando las capacidades de Tailwind 4 y variables CSS. Centraliza también:

- anchos máximos de contenido (aprox. 1200–1320 px);
- radios: pequeños en campos/botones y moderados en tarjetas; evita que todo sea una cápsula;
- sombras suaves y consistentes;
- escala tipográfica fluida mediante `clamp()` cuando aporte valor;
- altura/offset acumulado de la cabecera;
- estados de foco visibles;
- tiempos y curvas de transición.

Reutiliza la fuente local existente si ofrece una identidad consistente. No importes fuentes desde terceros ni añadas dependencias solo por estética. Usa Lucide React para iconos genéricos; no dibujes imitaciones de iconos de la referencia.

### 5. Arquitectura global requerida

Refactoriza `AppShell` para que la estructura sea compartida y funcione correctamente desde cualquier ruta.

#### 5.1 Franja superior

Crea una franja informativa compacta y accesible. Debe mostrar información real existente o neutral, por ejemplo “Atención con reserva · Baño y limpieza de oídos”. No inventes horarios, descuentos, sucursales, cifras o cobertura geográfica. Si falta un dato comercial, usa contenido neutro o déjalo configurable.

#### 5.2 Cabecera principal

Incluye:

- marca Caninany y descriptor “Baño y oídos”;
- navegación clara hacia Servicios, Experiencia, Galería y Opiniones;
- entrada a cuenta/perfil o administración según sesión;
- CTA principal “Reservar una hora”;
- acceso a WhatsApp solamente si existe un número real/configurado; no uses enlaces ficticios;
- comportamiento sticky o fixed sin tapar contenido ni anclas.

No incluyas una caja de búsqueda decorativa: Caninany no posee un catálogo que buscar.

#### 5.3 Navegación secundaria

En escritorio puede existir una segunda barra compacta que refuerce las secciones o rutas principales: Inicio, Servicios, Cómo trabajamos, Galería, Opiniones y Nosotros. En móvil, intégrala en un drawer/menú único; no apiles tres barras altas.

Todos los enlaces de secciones deben funcionar también cuando el usuario está en `/ingresar`, `/registro`, `/agendar`, `/perfil`, `/admin` o `/nosotros`. Usa rutas como `/#servicios` y un mecanismo confiable de scroll al hash, no un `href="#servicios"` que falle fuera de la portada.

#### 5.4 Footer compartido

Mueve el footer fuera de `HomePage` y conviértelo en parte reutilizable del layout público, sin duplicarlo en cada página. Debe contener únicamente información real:

- marca y descripción breve;
- navegación del sitio;
- servicios reales;
- acceso a reserva y cuenta;
- contacto y redes solo si están configurados;
- enlaces legales si existen; no simules páginas legales inexistentes;
- copyright calculado dinámicamente.

Antes del footer agrega una franja de contacto de tres columnas inspirada en el patrón de referencia, adaptada a Caninany: “Escríbenos”, “Conversemos” y “Reserva”. Si correo, teléfono o WhatsApp no están disponibles en el proyecto, no inventarlos: deja una fuente de configuración clara, oculta el dato faltante o usa una acción interna válida.

### 6. Estructura requerida para la portada

Conserva el contenido comercial actual, pero reorganízalo con la siguiente jerarquía. No es necesario que todas las secciones sean idénticas a la referencia; sí deben formar un recorrido claro.

#### 6.1 Hero fotográfico

- Imagen protagonista amplia utilizando assets propios existentes.
- H1 único con el contenido configurable actual (`heroTitle` y `heroHighlight`).
- Descripción editable actual.
- CTA principal a reserva y CTA secundario a servicios.
- Tres pruebas cualitativas existentes: atención sin apuros, productos suaves y reserva simple.
- Overlay suficiente para legibilidad y recorte responsive controlado.
- Evita cajas flotantes excesivas y animaciones decorativas constantes.

#### 6.2 Franja de propósito

Debajo del hero, incorpora una franja de color de alto contraste con una declaración breve basada en la propuesta actual: cuidado paciente, seguro y adaptado a cada mascota. No copies el propósito de Petvet. Debe poder leerse en dos o tres líneas como máximo.

#### 6.3 Servicios

Presenta exactamente:

1. Baño completo.
2. Limpieza externa de oídos.
3. Cuidado completo (combinación de ambos), claramente identificado como combinación, no como un servicio clínico adicional.

Cada bloque debe mostrar icono, nombre, descripción, duración ya existente cuando sea válida y CTA a reserva. En escritorio puede usar una composición editorial de filas o tarjetas amplias; en móvil debe ser una columna. Mantén la conexión real con el formulario y los valores que acepta el backend.

#### 6.4 Señales de confianza

Crea una fila de cuatro argumentos cualitativos, con iconos lineales y texto breve. Usa únicamente afirmaciones defendibles ya presentes en el sitio, por ejemplo:

- atención sin apuros;
- tiempo adaptado al servicio y tamaño;
- ambiente limpio y seguro;
- confirmación directa/proceso de reserva claro.

No inventes número de clientes, cantidad de atenciones, años de experiencia, estrellas, certificaciones o garantías. Los testimonios existentes pueden conservarse, pero no agregues nuevos datos ficticios.

#### 6.5 Experiencia / cómo trabajamos

Mantén el contenido “Menos estrés. Más confianza.” y los pilares de tiempo dedicado, ambiente seguro y trato personalizado. Usa una composición imagen + texto que recuerde el ritmo editorial de la referencia sin copiar su layout exacto.

#### 6.6 Galería

Conserva los assets propios y el lightbox existente, pero armoniza la cuadrícula, overlays, radios y tipografía con el nuevo sistema. Mantén:

- textos alternativos útiles;
- cierre por Escape y botón visible;
- bloqueo/restauración correcta del scroll;
- foco accesible dentro del diálogo o implementación de diálogo nativo/accesible;
- carga diferida de imágenes que no sean LCP.

#### 6.7 Nosotros / equipo

Añade una ruta pública `/nosotros` y un resumen enlazado desde la portada. Esta página debe adoptar la narrativa general de la referencia:

- hero o fotografía propia del espacio/equipo, si existe;
- propósito de Caninany;
- valores o forma de atención;
- señales de confianza cualitativas;
- bloque “Conoce al equipo” solo con nombres, cargos y fotos reales disponibles.

Si no existen datos o fotos reales del equipo, no inventes personas. Usa un bloque institucional breve con una fotografía genérica propia ya disponible, o deja una estructura basada en datos preparada para completarse desde administración. No uses fotos de Petvet ni imágenes remotas con licencias dudosas.

#### 6.8 Opiniones

Conserva la sección existente, pero no presentes una nota agregada (“4.9 de 5”) como hecho si no existe una fuente comprobable. Si la cifra actual es demostrativa, elimínala o marca el contenido para ser sustituido por datos reales. No inventes perfiles o reseñas adicionales.

#### 6.9 Reserva

La reserva sigue siendo el objetivo principal. Conserva `DeferredAppointmentForm` y toda su integración real. Rediseña únicamente su envoltorio visual y, si hace falta, los componentes internos sin modificar:

- payloads;
- esquemas Zod;
- reglas de peso/duración;
- consulta de disponibilidad;
- manejo de conflictos;
- estados de carga, error, confirmación y envío;
- comportamiento para invitado/autenticado que ya exista.

El formulario debe quedar visible en el recorrido, con suficiente contraste y sin quedar oculto por la cabecera al navegar a `#reservar`.

### 7. Resto de las páginas

El cambio debe ser de sistema, no una portada aislada.

#### Autenticación (`/ingresar`, `/registro`)

- Usa la misma cabecera, tokens, campos, botones y mensajes.
- Diseño sobrio, sin hero comercial gigante.
- Mantén validación, navegación, sesión y errores reales.

#### Agenda (`/agendar`)

- Da prioridad al calendario/formulario y a los próximos pasos.
- Conserva toda la lógica existente.
- Asegura que los estados seleccionados, disabled, hover, foco, error y éxito sean distinguibles sin depender solo del color.

#### Perfil de cliente (`/perfil`)

- Unifica navegación, títulos, tarjetas, formularios y tablas/listas con el sistema visual.
- No ocultes funciones existentes de mascotas y compras.
- Respeta estados vacío, carga y error.

#### Administración (`/admin`)

- Mantén densidad adecuada para una herramienta operativa: no uses tarjetas enormes ni marketing decorativo.
- Conserva gestión de usuarios y editor de contenido.
- El rediseño de administración debe compartir tokens, no necesariamente la misma composición de la portada.

### 8. Contenido editable y backend

Actualmente el editor de sitio cubre título, destacado, descripción e imagen del hero, más textos introductorios de servicios. Reutiliza esos campos y no los conviertas en valores hardcodeados.

Si decides hacer editables nuevas secciones, implementa el cambio completo y consistente:

1. migración Prisma/PostgreSQL segura con valores iniciales;
2. modelo y repositorio;
3. contratos/esquemas Zod compartidos;
4. servicio/controlador backend;
5. API y hook frontend;
6. controles del editor administrativo;
7. validación, carga, error y confirmación;
8. pruebas correspondientes.

No amplíes el backend solo para almacenar decisiones puramente visuales. Prioriza configuración para contenido comercial real (propósito, contacto, redes, textos) y mantén tokens/diseño en frontend.

### 9. Responsive y comportamiento

Valida al menos estos anchos:

- móvil estrecho: 320–390 px;
- móvil grande: 430 px;
- tablet: 768 px;
- portátil: 1024–1280 px;
- escritorio: 1440 px;
- escritorio amplio: 1920 px.

Requisitos:

- nada de scroll horizontal;
- tipografía legible sin saltos absurdos;
- CTA accesible sin tapar contenido;
- menú móvil con `aria-expanded`, cierre por Escape y control de foco;
- imágenes con `object-position` adaptado por breakpoint;
- columnas que se conviertan en una secuencia lógica en móvil;
- targets táctiles mínimos cercanos a 44 × 44 px;
- cabecera compacta en móvil;
- footer legible y no excesivamente largo;
- respeto de `prefers-reduced-motion`.

### 10. Accesibilidad, semántica y SEO

- Un solo `h1` por página y jerarquía de encabezados correcta.
- `header`, `nav`, `main`, `section`, `article`, `aside` y `footer` donde corresponda.
- Enlace “Saltar al contenido”.
- Contraste WCAG AA como mínimo.
- Foco visible en todos los controles.
- Navegación completa por teclado.
- Etiquetas de formulario y errores asociados de manera programática.
- `aria-live` para resultados relevantes de formularios.
- Alt descriptivos; alt vacío para imágenes estrictamente decorativas.
- No uses texto dentro de imágenes.
- Añade o corrige título, descripción, Open Graph, canonical y metadata por ruta mediante una solución proporcional al stack actual.
- No agregues datos estructurados con información comercial inventada.

### 11. Rendimiento y calidad técnica

- Evita dependencias nuevas si React, CSS/Tailwind y Lucide resuelven el problema.
- Mantén lazy loading de rutas y secciones no críticas.
- El hero debe reservar espacio y priorizar correctamente la imagen LCP.
- Usa WebP/AVIF existentes o genera variantes optimizadas solo desde assets propios.
- No cargues imágenes externas en runtime.
- Evita re-renderizados innecesarios, listeners sin limpieza y animaciones costosas.
- Mantén o mejora el presupuesto de bundle existente.
- Extrae componentes cuando tengan una responsabilidad clara; evita un archivo monolítico y también una fragmentación excesiva.
- Define datos repetidos (servicios, confianza, navegación, footer) en estructuras tipadas, sin duplicación.
- No uses `any`, `@ts-ignore`, HTML inseguro o estilos inline salvo valores dinámicos justificados.

### 12. Orden de ejecución

Trabaja en fases verificables:

1. **Auditoría:** inventario de rutas, componentes, contenido, assets, funcionalidades y estado del worktree.
2. **Fundaciones:** tokens, tipografía, fondo, contenedor, foco y utilidades globales.
3. **Layout global:** franja, header, navegación móvil/escritorio, contacto y footer.
4. **Portada:** hero, propósito, servicios, confianza, experiencia, galería, opiniones y reserva.
5. **Nosotros:** nueva ruta y contenido únicamente con datos propios/verificables.
6. **Páginas funcionales:** autenticación, agenda, perfil y administración.
7. **Configuración:** ampliar full stack solo si es necesario y justificado.
8. **Verificación automática:** formato, lint, typecheck, tests, build y presupuesto de bundle.
9. **QA visual real:** revisar con navegador en móvil y escritorio; capturar screenshots y corregir desbordes, solapamientos, contraste, navegación y estados.
10. **Entrega:** resumen de archivos, decisiones, pruebas, limitaciones y datos reales aún requeridos.

No te limites a proponer código o entregar un plan. Implementa la migración en el repositorio. Antes de hacer cambios amplios, presenta un plan breve y luego avanza sin pedir confirmación para decisiones visuales menores. Solo detente si falta una decisión comercial que cambie materialmente el alcance o si necesitas datos que no se pueden inferir sin inventarlos.

### 13. Verificación obligatoria

Ejecuta desde la raíz, corrige los fallos causados por la migración y reporta resultados:

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm run performance:check
```

Si ya existía un fallo no relacionado, demuéstralo y no lo ocultes. Añade pruebas frontend enfocadas en comportamiento crítico cuando modifiques navegación, menú, diálogo, formularios o renderizado condicional. Realiza QA con navegador real en `/`, `/nosotros`, `/agendar`, `/ingresar`, `/registro`, `/perfil` y `/admin` cuando sea posible; para rutas protegidas, comprueba al menos redirección y layout sin romper autorización.

### 14. Criterios de aceptación

La tarea solo está terminada si:

- la identidad final es propia de Caninany y no una copia de Petvet;
- baño, limpieza de oídos y el combo siguen siendo los únicos servicios ofrecidos;
- no se introdujeron afirmaciones, personas, estadísticas o contactos ficticios;
- el sistema de agenda continúa conectado al backend y funciona;
- login, registro, sesión, perfil, mascotas, compras y administración conservan su comportamiento;
- la configuración existente continúa alimentando la portada;
- navegación y anclas funcionan desde todas las rutas;
- header/footer son compartidos y no están duplicados;
- `/nosotros` existe y usa exclusivamente contenido/activos propios;
- la experiencia es coherente y usable de 320 a 1920 px;
- teclado, foco, contraste y reduced motion han sido revisados;
- no hay scroll horizontal, contenido tapado ni errores visibles de consola;
- imágenes están optimizadas y no dependen de Petvet;
- lint, typecheck, tests y build pasan;
- el resultado fue inspeccionado visualmente en navegador, no solo compilado.

### 15. Formato de la entrega final

Al terminar, responde con:

1. resultado implementado en pocas líneas;
2. lista de páginas/componentes transformados;
3. decisiones visuales principales y cómo se diferencian de la referencia;
4. pruebas/comandos ejecutados y resultado;
5. datos o assets reales todavía pendientes, sin inventarlos;
6. enlaces a los archivos principales modificados.

## FIN DEL PROMPT
