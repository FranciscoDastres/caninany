# Límites arquitectónicos

La regla principal es que las dependencias apuntan hacia el dominio:

```text
HTTP / Prisma / JWT -> Application -> Domain
```

`domain` solo puede usar TypeScript y elementos puros del paquete compartido.
`application` depende de interfaces, no de adaptadores concretos.
`infrastructure` traduce entre protocolos externos y los modelos internos.

En frontend, las dependencias compartidas viven en `core`, `components/ui` o
`lib`. Una feature no debe importar internals de otra feature; la integración
se hace mediante rutas, contratos públicos o servicios compartidos.
