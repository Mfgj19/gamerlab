# GamerLab

GamerLab es una tienda online de equipos y periféricos para videojuegos, estudio y creación de contenido. Fue desarrollada por **Fernanda Gómez** como proyecto académico de Desarrollo Web.

La aplicación permite explorar productos, crear una cuenta, preparar un carrito y realizar una compra simulada. Incluye un panel privado para administrar el catálogo, los pedidos, los usuarios y los comentarios.

## Funcionalidades

### Tienda y catálogo

- Inicio con identidad visual propia, accesos por categoría y productos destacados consultados desde Firebase.
- Catálogo de **15 productos**, organizado en Equipos, Periféricos, Simulación y Mobiliario.
- Productos obtenidos desde Cloud Firestore, con descripción, precio en USD, stock y disponibilidad.
- Buscador en la barra superior con vista previa de imagen, nombre y precio, navegación por teclado y acceso al producto o a los resultados del catálogo.
- Búsqueda por nombre sin distinción de tildes, filtros por categoría, ordenamiento por nombre o precio y contador de resultados.
- Detalle con tres imágenes por producto, características técnicas y productos relacionados.
- Valoraciones de una a cinco estrellas, promedio y comentarios guardados en Firestore.
- Diseño adaptable a computadoras, tablets y teléfonos.

### Cuentas y perfil

- Registro, inicio y cierre de sesión con correo y contraseña mediante Firebase Authentication.
- Registro con confirmación de contraseña y un mínimo de seis caracteres.
- Menú de cuenta en la barra superior con acceso al perfil y cierre de sesión.
- Perfil con nombre, correo, fecha de registro, tipo de cuenta e historial personal de pedidos.
- Roles `cliente` y `administrador`. Las cuentas nuevas reciben el rol `cliente`.

### Carrito y compras

- Agregar productos desde el inicio, el catálogo o el detalle.
- Modificar cantidades y quitar productos, con comprobación de stock.
- Carrito persistente en LocalStorage, separado por cuenta y visitante.
- Acceso al inicio de sesión cuando un visitante intenta comprar y recuperación de su selección al continuar la compra.
- Resumen con subtotal, envío y total. El envío simulado cuesta USD 20 y es gratuito en compras de USD 500 o más.
- Hasta ocho productos distintos por pedido.
- Confirmación mediante una transacción de Firestore que comprueba precios y stock, registra el pedido y descuenta las existencias en una misma operación.
- Vaciado del carrito después de registrar correctamente la compra e historial de pedidos en el perfil.

### Administración

El panel está reservado a cuentas administradoras activas. Se organiza en cinco pestañas:

- **Resumen:** estadísticas de productos disponibles, inventario, pedidos y usuarios, con accesos directos a cada área.
- **Productos:** creación y edición de nombre, categoría, descripción, precio, stock, disponibilidad, tres imágenes y características. Permite activar o desactivar productos.
- **Pedidos:** consulta de compras y actualización de su estado.
- **Usuarios:** consulta de cuentas y activación o desactivación. El administrador no puede desactivar su propia cuenta desde el panel.
- **Comentarios:** consulta y moderación mediante ocultamiento reversible.

Los productos desactivados o sin stock no se muestran en el catálogo público. La desactivación de una cuenta restringe sus operaciones en Firestore, pero conserva su registro en Firebase Authentication.

## Tecnologías

- HTML5 y CSS3.
- JavaScript con módulos ES.
- Bootstrap 5.
- Firebase Authentication para las cuentas y las sesiones.
- Cloud Firestore para productos, usuarios, pedidos y opiniones.
- LocalStorage para la persistencia del carrito.
- Git y GitHub para el control de versiones.
- GitHub Pages para la publicación del sitio.

## Ejecución local

1. Descargar o clonar el repositorio:

   ```bash
   git clone https://github.com/Mfgj19/gamerlab.git
   ```

2. Abrir la carpeta `gamerlab` en Visual Studio Code.
3. Iniciar un servidor local, por ejemplo con la extensión **Live Server**, y abrir `index.html` desde ese servidor.
4. Mantener conexión a internet para cargar Firebase, Bootstrap, las tipografías y los datos del catálogo.

No se necesita instalar paquetes ni ejecutar una compilación. Es necesario utilizar un servidor local porque el proyecto carga módulos JavaScript.

Para conservar el carrito durante las pruebas, utilizar la misma dirección y puerto: el almacenamiento pertenece al origen del sitio y al navegador utilizado.

## Firebase y datos

La configuración se encuentra en `js/firebase/config.js` y corresponde al proyecto Firebase `gamerlab-1a163`.

| Colección | Contenido |
| --- | --- |
| `productos` | Nombre, categoría, descripción, precio, stock, disponibilidad, imágenes y características. |
| `usuarios` | Nombre, correo, rol, fecha de registro y estado de la cuenta, asociados al UID de Authentication. |
| `pedidos` | Usuario, productos, cantidades, importes, envío, fecha y estado. |
| `opiniones` | Producto, usuario, puntuación, comentario y visibilidad. |

El catálogo se consulta desde Firestore. Si falla la conexión, la aplicación informa el problema y no sustituye los datos por un catálogo local.

Las reglas de seguridad están publicadas en Firebase Console. Aplican permisos según la sesión, el rol y el estado de la cuenta: cada cliente consulta sus propios datos y pedidos; la gestión de la tienda queda reservada a administradores.

Para evaluar el panel se necesita una cuenta con el rol `administrador` asignado en Firestore. El formulario de registro público solo crea cuentas de cliente.

Las imágenes están almacenadas en `assets/img/productos/`; Firestore guarda sus rutas. El panel permite indicar rutas o direcciones HTTPS, pero no sube archivos a Firebase Storage.

La ejecución local utiliza la misma base configurada. Las altas y modificaciones de productos, pedidos, usuarios y opiniones se guardan en ese proyecto Firebase.

## Recorrido del proyecto

1. Explorar las categorías del inicio o buscar un producto en la barra superior.
2. Abrir su detalle, recorrer las imágenes y consultar sus características.
3. Crear una cuenta o iniciar sesión desde `perfil.html`.
4. Agregar productos con stock al carrito, ajustar cantidades y confirmar la compra simulada.
5. Consultar el pedido desde el perfil y publicar una valoración o comentario desde el detalle del producto.
6. Con una cuenta administradora, acceder al panel y recorrer sus cinco secciones.

## Estructura del proyecto

```text
gamerlab/
├── index.html                  # Inicio y categorías
├── catalogo.html               # Catálogo, búsqueda y filtros
├── producto.html               # Detalle, galería y opiniones
├── carrito.html                # Selección y confirmación de compra
├── perfil.html                 # Acceso, registro, cuenta y pedidos
├── admin.html                  # Panel administrativo
├── css/
│   └── styles.css              # Estilos y adaptación a pantallas
├── js/
│   ├── base.js                 # Comportamiento general
│   ├── inicio.js               # Productos destacados
│   ├── buscador.js             # Búsqueda con vista previa
│   ├── catalogo.js             # Filtros y ordenamiento
│   ├── productos.js            # Consulta de productos a Firestore
│   ├── tarjetas.js             # Tarjetas compartidas de productos
│   ├── producto.js             # Detalle, valoraciones y comentarios
│   ├── carrito.js              # Carrito por cuenta y visitante
│   ├── seguridad.js            # Validación de datos y contenido
│   ├── admin-navegacion.js     # Accesos directos del panel
│   └── firebase/
│       ├── config.js           # Conexiones de Firebase
│       ├── auth.js             # Registro, sesión y permisos
│       ├── pedidos.js          # Compra e historial de pedidos
│       └── admin.js            # Gestión administrativa
├── assets/
│   └── img/                    # Logos, imágenes y productos
└── README.md
```

## Identidad visual

GamerLab utiliza una estética inspirada en hardware y espacios de juego. Combina azul petróleo (`#164E63`), cian (`#0891B2`), azul oscuro (`#172554`) y magenta (`#DB2777`), con fondos claros y oscuros. Las tipografías son **Rajdhani** para títulos e **Inter** para textos.

## Alcance de la simulación

El proyecto tiene fines académicos. La compra no procesa pagos ni solicita datos bancarios. Los pedidos sí se registran en Firestore y modifican el stock. Los precios, las características y las imágenes representan el catálogo de la tienda simulada.

## Enlaces

- [Visitar GamerLab](https://mfgj19.github.io/gamerlab/)
- [Repositorio en GitHub](https://github.com/Mfgj19/gamerlab)
