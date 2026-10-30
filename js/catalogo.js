import { tarjetasProductos, activarBotonesCarrito } from './tarjetas.js';
function mostrarProductos(productos) {
 const contenedor = document.querySelector('#catalogoProductos');
 contenedor.innerHTML = productos.length ? tarjetasProductos(productos) : '<div class="col-12"><div class="catalogo-vacio"><h2 class="h3">No encontramos coincidencias</h2><p>Prueba con otro nombre o cambia la categoría.</p><button type="button" class="btn btn-outline-primary" id="restablecerBusqueda">Ver todos los productos</button></div></div>';
 activarBotonesCarrito(contenedor);
 document.querySelector('#restablecerBusqueda')?.addEventListener('click', limpiarFiltros);
}
const buscador = document.querySelector("#buscarProducto");
const selectorCategoria = document.querySelector("#filtroCategoria");
const selectorOrden = document.querySelector("#ordenProductos");
const cantidadResultados = document.querySelector("#cantidadResultados");
const botonLimpiar = document.querySelector("#limpiarFiltros");

function aplicarFiltros() {

    const normalizar = texto => texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const textoBusqueda = normalizar(buscador.value.trim());
    const categoriaSeleccionada = selectorCategoria.value;

    let productosFiltrados = window.productos.filter((producto) =>
        normalizar(producto.nombre).includes(textoBusqueda)
    );

    if (categoriaSeleccionada !== "Todas") {

        productosFiltrados = productosFiltrados.filter((producto) =>
            producto.categoria === categoriaSeleccionada
        );

    }
    const ordenSeleccionado = selectorOrden.value;

    if (ordenSeleccionado === "Precio menor") {

        productosFiltrados.sort((a, b) =>
            a.precio - b.precio
        );

    } else if (ordenSeleccionado === "Precio mayor") {

        productosFiltrados.sort((a, b) =>
            b.precio - a.precio
        );

    } else if (ordenSeleccionado === "Nombre AZ") {

        productosFiltrados.sort((a, b) =>
            a.nombre.localeCompare(b.nombre)
        );

    } else if (ordenSeleccionado === "Nombre ZA") {

        productosFiltrados.sort((a, b) =>
            b.nombre.localeCompare(a.nombre)
        );

    }
    cantidadResultados.textContent = productosFiltrados.length === 1
        ? "1 producto encontrado"
        : `${productosFiltrados.length} productos encontrados`;
    mostrarProductos(productosFiltrados);
}

function limpiarFiltros() {

    buscador.value = "";
    selectorCategoria.value = "Todas";
    selectorOrden.value = "Sin ordenar";

    aplicarFiltros();
}

buscador.addEventListener("input", aplicarFiltros);
selectorCategoria.addEventListener("change", aplicarFiltros);
selectorOrden.addEventListener("change", aplicarFiltros);
botonLimpiar.addEventListener("click", limpiarFiltros);

function iniciarCatalogo(evento) {
    if (evento.detail.error) {
        mostrarMensaje(evento.detail.error);
    }

    if (evento.detail.error) { cantidadResultados.textContent = ""; document.querySelector("#catalogoProductos").innerHTML = '<p role="alert">No se pudo cargar el catálogo. Revisa la conexión y recarga la página.</p>'; return; }
    cantidadResultados.textContent = window.productos.length === 1
        ? "1 producto encontrado"
        : `${window.productos.length} productos encontrados`;
    aplicarFiltros();
}


const parametrosCatalogo = new URLSearchParams(window.location.search);
buscador.value = parametrosCatalogo.get('q') || '';
const categoriaInicial = parametrosCatalogo.get('categoria');
if ([...selectorCategoria.options].some(opcion => opcion.value === categoriaInicial)) selectorCategoria.value = categoriaInicial;
cantidadResultados.textContent = "Cargando productos...";

window.addEventListener("productosCargados", iniciarCatalogo);

if (window.estadoProductos) {
    iniciarCatalogo({ detail: window.estadoProductos });
}
