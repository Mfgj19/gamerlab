# GamerLab
## Estudiante

Fernanda Gómez

## Descripción

GamerLab es una tienda online especializada en computadoras gamer, componentes y periféricos. Su propósito es ofrecer soluciones para quienes desean comprar, actualizar o armar un equipo según sus necesidades.

La propuesta combina rendimiento, tecnología y personalización en una experiencia de navegación clara, moderna y profesional.


## Público objetivo

Jóvenes y adultos interesados en armar, actualizar o comprar computadoras y periféricos para videojuegos, estudio, streaming y creación digital.


## Categorías de productos

- PC gamer
- Componentes
- Monitores
- Teclados y mouse
- Audio
- Almacenamiento
- Accesorios


## Tecnologías utilizadas

- HTML5
- CSS3
- Bootstrap
- JavaScript
- Git
- GitHub

## Estructura general del proyecto


```text
gamerlab/
├── index.html
├── catalogo.html
├── producto.html
├── carrito.html
├── perfil.html
├── admin.html
├── css/
│   └── styles.css
├── js/
│   ├── base.js
│   ├── productos.js
│   ├── catalogo.js
│   └── producto.js
├── assets/
│   └── img/
│       ├── hero/
│       ├── logo/
│       ├── productos/
│       └── beneficios/
├── README.md
└── .gitignore
```
## Instrucciones de ejecución

1. Descargar o clonar el repositorio.
2. Abrir la carpeta del proyecto en Visual Studio Code.
3. Abrir el archivo `index.html` en el navegador.
4. También puede utilizarse la extensión Live Server para visualizar los cambios durante el desarrollo.

## Funcionalidades desarrolladas en el Sprint 1

- Identidad visual propia.
- Página de inicio completamente personalizada.
- Barra de navegación responsive.
- Logotipo enlazado a la página de inicio.
- Indicador visual estático del carrito.
- Botón de inicio de sesión con aviso de funcionalidad correspondiente al Sprint 3.
- Sección principal o hero personalizada.
- Seis productos destacados escritos directamente en HTML.
- Tarjetas de productos adaptables y coherentes con la identidad visual.
- Sección de beneficios con imágenes, títulos y descripciones.
- Pie de página con enlaces, información de contacto y aclaración académica.
- Navegación entre las páginas principales.
- Diseño adaptable a dispositivos móviles, tablets y equipos de escritorio.
- Condiciones básicas de accesibilidad.
- Uso de HTML semántico.
- Páginas futuras enlazadas y señaladas como funcionalidades en desarrollo.

## Sprint 2

### Avance al 23/08 - Productos y catálogo dinámico

- Se creó un arreglo de productos en JavaScript.
- Cada producto está representado mediante un objeto.
- Los productos incluyen identificador, nombre, descripción, categoría, precio, stock e imagen.
- El catálogo se genera dinámicamente desde JavaScript.
- Las tarjetas se insertan en `catalogo.html` mediante manipulación del DOM.
- Se utiliza una función `mostrarProductos(productos)` para recorrer y mostrar el catálogo.
- La lógica del catálogo se organizó en los archivos `productos.js` y `catalogo.js`.

### Avance al 30/08 - Búsqueda, filtros y eventos

- Se incorporó un campo de búsqueda de productos por nombre.
- Se agregó un selector para filtrar los productos por categoría.
- Se combinaron la búsqueda por nombre y el filtro por categoría.
- Se utilizaron eventos `input` y `change` para actualizar el catálogo.
- Los productos se filtran dinámicamente mediante JavaScript.
- Se muestra un mensaje cuando no existen productos que coincidan con la búsqueda y el filtro seleccionados.
- Al limpiar la búsqueda y seleccionar todas las categorías, se vuelve a mostrar el catálogo completo.

### Avance al 06/09 - Detalle dinámico del producto

- Se incorporó la navegación desde las tarjetas del catálogo hacia `producto.html`.
- Cada producto envía su identificador mediante la URL.
- Se utiliza `URLSearchParams` para obtener el identificador del producto desde la URL.
- Se utiliza `find()` para buscar el producto correspondiente dentro del arreglo.
- Se creó `producto.js` para manejar la lógica del detalle del producto.
- La página `producto.html` muestra dinámicamente la imagen, categoría, nombre, descripción, precio y stock del producto seleccionado.
- Se utiliza una única página `producto.html` para mostrar los diferentes productos.
- Se muestra un mensaje cuando el identificador recibido no corresponde a ningún producto existente.

### Pendiente para las próximas etapas del Sprint 2

- Carrito de compras.
- Persistencia mediante LocalStorage.

## Funcionalidades pendientes

- Registro e inicio de sesión.
- Firebase Authentication.
- Cloud Firestore.
- Pedidos.
- Panel administrativo.
- Operaciones CRUD.
- Reglas de seguridad.
- Publicación final en GitHub Pages.

## Decisiones de diseño

La identidad visual de GamerLab busca transmitir precisión, potencia y experimentación tecnológica. La estética se inspira en componentes, circuitos, placas y configuraciones gamer, manteniendo una interfaz limpia y profesional.

### Paleta de colores

- Azul cian: `#0891B2`
- Azul oscuro: `#172554`
- Magenta de acento: `#DB2777`
- Fondo oscuro: `#111827`
- Fondo claro: `#F1F5F9`
- Texto principal: `#0F172A`

### Tipografías

- Títulos: Rajdhani
- Textos: Inter

### Eslogan

> Construí la potencia que necesitás.

## Diseño responsive

La interfaz fue revisada en los siguientes tamaños aproximados:
- Teléfono: 375 px
- Tablet: 768 px
- Escritorio: 1366 px


## Estado del proyecto

Sprint 1 finalizado.

Sprint 2 en desarrollo.

- Avance al 23/08 completado: productos y catálogo dinámico.
- Avance al 30/08 completado: búsqueda por nombre, filtros por categoría y eventos.
- Avance al 06/09 completado: detalle dinámico del producto, identificador mediante URL, búsqueda con `find()` y visualización de la información desde JavaScript.

## Enlace al repositorio

https://github.com/Mfgj19/gamerlab

## Enlace a GitHub Pages

Se incorporará cuando la aplicación sea publicada.
