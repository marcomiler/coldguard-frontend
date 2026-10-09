# Decisiones de diseño

Registro de decisiones no obvias, con su porqué. Las **reglas** vigentes están en [design-system.md](design-system.md); aquí queda el historial y el razonamiento.

## Vigentes

1. **Tailwind + Radix primitives, sin librería de componentes completa.** Radix resuelve foco, teclado y ARIA; Tailwind da layouts responsive sin CSS propio.
2. **Todo estado de datos tiene los cuatro casos** (loading, empty, error, success), con `role` adecuado. Es regla del proyecto.
3. **El error muestra el código de seguimiento (`correlationId`)** para que soporte rastree la petición en los logs del backend.
4. **El significado nunca depende solo del color:** prioridad, criticidad y estado llevan texto.
5. **Sesión en `sessionStorage`** (el backend no emite cookies ni refresh). Sobrevive a recargas y se pierde al cerrar la pestaña; solo se restaura si el token no ha vencido y expira sola a la hora indicada por el backend. Costo asumido: un XSS podría leer el token; se mitiga evitando HTML inyectado y librerías de terceros.
6. **La UI oculta lo que el rol no puede hacer, pero no es la autoridad.** Un acceso sin permiso muestra un mensaje en lugar de redirigir en silencio.
7. **Nada simulado en el producto** (revisada el 2026-10-06; antes avisaba «datos simulados»). Lo que el backend aún no ofrece se oculta, no se imita.
8. **Navegación por teclado:** enlace «Saltar al contenido», foco visible global, tablas con `caption` y `th scope`, formularios con label visible y errores asociados.
9. **Tokens en dos capas (primitivos → semánticos) y tema con `light-dark()` (2026-10-06).** Los componentes consumen solo semánticos (`bg-surface`, `text-fg`…) y nunca `dark:`. Así rediseñar o añadir un tema es editar `tokens.css`, sin tocar componentes. Se descartaron los tokens por componente (`--button-bg`): multiplican el contrato sin aportar.
10. **Se eliminan las escalas por defecto de Tailwind** (`--color-*: initial`, etc.). Quien diseña no puede usar por accidente un color o tamaño fuera del sistema; el chequeo automático cubre lo que Tailwind no impide.
11. **Sin CSS de componentes ni `tailwind-merge`.** Menos peso y una sola forma de estilizar. Costo: un `className` externo solo puede añadir clases.
12. **Fuentes del sistema por defecto** (sustituida por la 16 al elegir la dirección A). El criterio se mantiene: una webfont solo si cabe en el presupuesto.
13. **Reglas de diseño verificadas en `pnpm lint`** (`scripts/check-design-rules.mjs`): una regla que no se verifica se erosiona.
14. **Dirección elegida: A «Sala de Control» (2026-10-06).** Oscuro por defecto, bordes finos en lugar de sombras, cifras en monoespaciada, riel lateral. Sustituye la decisión 8 (tema según el sistema): ahora el tema por defecto es oscuro y el usuario lo cambia con `ThemeToggle`; la elección se guarda en `localStorage` y se aplica antes del primer pintado.
15. **Texto más pequeño que el contrato inicial.** Cuerpo 14 px, `small` 13 px, `caption` 12 px (antes 16/14/12) y control estándar de 32 px (antes 40). Es una interfaz de datos densa; WCAG 2.2 no fija un tamaño mínimo y se compensa con zoom al 200 %, reflow a 320 px y un suelo de 12 px. Los formularios de entrada y las acciones principales usan 40 px.
16. **Fuentes autoalojadas dentro del presupuesto.** IBM Plex Sans 400/600 + IBM Plex Mono 500 subseteadas y sin hinting: 23 kB de 30 kB. Solo dos pesos de sans: `font-medium` ya no existe (se renderizaría igual que el normal), el énfasis es siempre `font-semibold`.
17. **Vocabulario ampliado:** `variant` gana `danger`, `size` gana `lg` y `tone` gana `accent`. La criticidad de un activo usa una escala propia de 4 colores (neutral → info → warning → danger) con su etiqueta en texto; es la misma gama que la severidad pero se distingue por el contexto (columna «Criticidad», sin prefijo P1–P4). Roles tipográficos nuevos: `display`, `heading-4`, `code`.
18. **Los componentes no inventan datos.** La vista previa mostraba nombres de unidad, rangos y lecturas que el contrato actual no entrega; las pantallas reales muestran solo lo que devuelve la API (p. ej. el incidente trae `assetId`, no el nombre de la unidad).
19. **Áreas ocultas hasta que su backend exista.** Un área con operaciones `planned` no aparece en el menú, no es destino de aterrizaje y su ruta explica que aún no está disponible. Se activa con un solo valor (`ready`) en `roles.ts`.
20. **Aterrizaje por rol, no por historial.** Tras ingresar se va a la página solicitada solo si el rol puede abrirla; si no, a la primera pantalla disponible. Antes, un operador heredaba la ruta `/assets` del admin anterior y veía «sin acceso».
21. **Tema con ícono y usuario con identidad.** El tema se cambia con un botón de ícono (sol/luna, con nombre accesible); el pie del riel muestra una inicial circular, el nombre de usuario y el rol.
22. **Cambios sensibles piden motivo y se confirman en un diálogo** (asignar o revocar rol, habilitar o deshabilitar usuario), igual que exige el backend; las escrituras no son optimistas.
23. **Plazos como texto relativo y exacto.** «en 4 minutos» / «Vencido hace 2 horas», con `<time>` y la hora exacta en `title`. El vencimiento se dice con palabras y negrita, no solo con color. Se recalcula cada 30 s.
24. **Acciones de incidente según rol y estado.** El supervisor ve Reconocer (una vez) y Escalar (con motivo); el técnico, Cerrar (causa y cómo se resolvió); el operador no ve acciones. Los botones se ocultan cuando el estado ya no lo permite, pero el backend sigue siendo la autoridad de cada transición.
25. **Cierre sin depender de la respuesta.** `POST .../close` aún responde con la forma legada; la web la ignora y vuelve a leer el incidente, así que no se rompe cuando el backend pase a devolver el incidente completo.
26. **Bitácora de solo lectura con rango obligatorio.** Fechas en la zona horaria del usuario, filtros opcionales y «Cargar más» por cursor; el cambio (antes/después) se despliega bajo demanda.
27. **Sidebar fijo.** En escritorio el riel mide siempre el alto de la ventana (`sticky`, `h-dvh`) y no crece con el contenido; si el menú no cabe, hace scroll interno.
28. **Bloque de sesión en tarjeta.** Avatar con inicial, usuario y todos los roles (sin truncar) arriba; abajo, el interruptor de tema (con etiqueta «Oscuro/Claro») y «Salir» a la vista. Se eliminó el menú desplegable: cerrar sesión no debe esconderse.
29. **Reconocer fuera de plazo es posible y se dice.** Un plazo vencido solo cuenta como incumplimiento en las métricas (SPEC-007: reconocer exige que el incidente esté abierto y sin reconocer). La lista muestra «Vencido hace…» en rojo **y** el botón «Reconocer» (primario solo en P1) y el detalle conserva la acción.
30. **Listas largas se paginan siempre.** La bitácora usa cursor (20 por página, sin total conocido: «Página N», Anterior/Siguiente); el resto, paginación por número.
31. **Gráfico de temperatura propio, sin librería.** SVG con tokens, ancho medido para que el texto no se escale, ticks redondos, franja del rango seguro (perfil del sensor) y puntos rojos en lecturas fuera de rango. Solo para admin y supervisor, que son los roles a los que el backend entrega lecturas.
32. **El plazo vencido se explica, no se esconde.** El detalle muestra un aviso «Incidente fuera de plazo» con lo que sigue siendo posible (aún se puede reconocer; queda como incumplimiento en las métricas) y la lista lleva una nota fija. Un plazo ya cumplido muestra su hora exacta, no un cuenta atrás.
33. **Paginación solo al pie.** Como en el resto de tablas, los controles de la bitácora van únicamente debajo del listado. El id de la entidad se abrevia (8 caracteres, completo en `title`) para que las filas sean de una línea.
34. **La bitácora se lee, no se decodifica.** Acción y entidad se traducen («Incidente reconocido», «Sensor»), el actor distingue «Sistema» (servicio o job, nombrado) de «Usuario» (id abreviado) y el detalle lista cambios campo a campo con valores legibles (fechas, °C, estados), nunca JSON. El backend no entrega nombres de usuarios ni de entidades al auditor; sería una mejora del contrato (`actorName`, etiqueta de entidad).
35. **Resolver = cerrar, y lo hace el técnico.** No existe un estado «resuelto» distinto: el cierre es la resolución. La lista ofrece «Cerrar» directo al técnico y el detalle explica a los demás roles quién resuelve.
36. **Métricas con selector de periodo.** El cumplimiento de plazos filtra por fecha de creación del incidente y excluye los que no tienen plazo; por eso un incidente recién reconocido puede no aparecer. Se ofrece 1/7/30 días y una nota lo explica.
37. **Registrar unidad solo para administrador de plataforma.** `POST /assets` es exclusivo de `PLATFORM_ADMIN`; el diálogo encadena organización → sede y el botón no se muestra a otros roles.
38. **Sensores para administrador y supervisor.** Lista con estado, conexión (con señal / sin señal desde / sin lecturas), última lectura y vigencia de calibración, más tarjetas de resumen de conectividad. «Ver lecturas» abre el gráfico de temperatura del sensor (1 h a 7 días, el máximo del backend) con su rango seguro. Se limita a las 100 lecturas más recientes y se avisa. Operador, técnico y auditor no la ven: el backend les niega lecturas y sensores.
39. **Distribución con barras.** El resumen del supervisor suma barras por prioridad y por estado (SVG con tokens, misma escala; el número siempre se muestra, no solo la barra).
40. **Gráfico de temperatura compartido.** `TemperatureChart` (patrón) sirve al detalle de incidente y a Sensores; la feature solo aporta los datos.
41. **Gestión de sensores en la misma pantalla.** Al abrir un sensor, el administrador ve sus acciones (cambiar estado, calibrar, reasignar solo en mantenimiento, editar datos, retirar) y el historial; el supervisor solo ve lecturas y perfil. Cada acción es un diálogo con motivo obligatorio cuando el backend lo exige; el backend decide qué transiciones son válidas y la interfaz traduce su error. El retiro es definitivo y usa el botón de peligro.
42. **Perfil operativo editable solo por el administrador.** Los ocho valores numéricos se validan como números en el cliente; los invariantes (orden de bandas, rangos) los valida el backend y sus errores se muestran por campo. Sin perfil no se evalúan lecturas, y la pantalla lo dice.
43. **Organizaciones y sedes.** Lista de organizaciones y, al elegir una, sus sedes. Crear es solo del administrador; el supervisor consulta. Sin pantalla de detalle: no hay endpoint para obtener una organización por id.
44. **Editar unidad con control de versiones.** El diálogo envía `expectedVersion`; si alguien modificó la unidad, el backend responde `CONCURRENT_MODIFICATION` y se pide recargar. Una descripción vacía la borra.

## Pendiente

- Dashboard con una barra de rango por unidad (preview A). Hay endpoints de lecturas, perfil y conectividad, pero no uno agregado de «última lectura por unidad»: exigiría N+1 llamadas. Pendiente de decidir.
- Panel con barra de rango por unidad y series de incidentes en el tiempo: requieren endpoints nuevos del backend.
- Validar contraste con las pantallas reales y probar con lector de pantalla ([usability-checklist.md](../quality/usability-checklist.md)).

45. **Favicon.** `public/favicon.svg` reutiliza el termómetro de `BrandMark` sobre una base redondeada; usa `prefers-color-scheme` propio del SVG porque el navegador no aplica los tokens de la app dentro de la pestaña. Solo SVG: lo soportan los navegadores vigentes.

46. **Salir pide confirmación.** El botón «Salir» del sidebar abre un diálogo (`FormDialog` sin campos) antes de cerrar la sesión; «Cancelar» o Esc lo descartan y devuelven el foco al botón.
