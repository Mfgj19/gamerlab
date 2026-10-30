import './productos.js';
import { tarjetasProductos, activarBotonesCarrito } from './tarjetas.js';
const contenedor = document.querySelector('#productosInicio');
function mostrarInicio() {
    if (window.estadoProductos?.error) { contenedor.innerHTML = '<p role="alert">No se pudieron cargar los productos. <a href="catalogo.html">Volver al catálogo</a></p>'; return; }
    const seleccion = (window.productos || []).filter(p => p.disponible && p.stock > 0).slice(0,3);
    contenedor.innerHTML = seleccion.length ? tarjetasProductos(seleccion) : '<p class="text-secondary">Próximamente encontrarás nuevos productos aquí.</p>';
    activarBotonesCarrito(contenedor);
}
window.addEventListener('productosCargados', mostrarInicio);
if (window.estadoProductos) mostrarInicio();
