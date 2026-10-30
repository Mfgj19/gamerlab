import { auth, db } from './firebase/config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import { escaparHTML, imagenSegura, validarCarrito } from './seguridad.js';

let uidCarrito = null;
let sesionLista = false;
let avisoDatos = false;
let resolverSesion;
export const sesionCarritoLista = new Promise(resolve => { resolverSesion = resolve; });
export const claveCarritoActual = () => 'gamerlab:carrito:' + (uidCarrito || 'visitante');
export function mostrarMensaje(mensaje) {
    const toast = document.querySelector('#appToast');
    const texto = document.querySelector('#toastMessage');
    if (toast && texto) { texto.textContent = mensaje; bootstrap.Toast.getOrCreateInstance(toast).show(); }
}
export function obtenerCarrito(clave = claveCarritoActual()) {
    try { return validarCarrito(JSON.parse(localStorage.getItem(clave) || '[]')); }
    catch { if (!avisoDatos) { avisoDatos = true; mostrarMensaje('No se pudo recuperar el carrito guardado. Puedes volver a seleccionar los productos.'); } return []; }
}
export function guardarCarrito(carrito, clave = claveCarritoActual()) {
    try { localStorage.setItem(clave, JSON.stringify(validarCarrito(carrito))); actualizarContadorCarrito(); return true; }
    catch { mostrarMensaje('No se pudo guardar el carrito en este navegador. Revisa los permisos de almacenamiento.'); return false; }
}
export function incorporarCarritoVisitante() {
    if (!uidCarrito) return;
    const visitante = obtenerCarrito('gamerlab:carrito:visitante');
    const propio = obtenerCarrito();
    visitante.forEach(item => {
        const existente = propio.find(p => p.idProducto === item.idProducto);
        if (existente) existente.cantidad = Math.min(1000000, existente.cantidad + item.cantidad);
        else propio.push(item);
    });
    if (guardarCarrito(propio)) guardarCarrito([], 'gamerlab:carrito:visitante');
}
export function actualizarContadorCarrito() {
    const contador = document.querySelector('#contadorCarrito');
    if (contador) contador.textContent = sesionLista ? obtenerCarrito().reduce((s, p) => s + p.cantidad, 0) : '0';
}
export async function agregarAlCarrito(idProducto) {
    await sesionCarritoLista;
    const clave = claveCarritoActual();
    try {
        if (window.estadoProductos?.error) throw new Error('No se puede comprobar el catálogo. Recarga la página para volver a intentarlo.');
        const snapshot = await getDoc(doc(db, 'productos', idProducto));
        if (clave !== claveCarritoActual()) return false;
        if (!snapshot.exists()) throw new Error('El producto ya no está disponible.');
        const producto = snapshot.data();
        if (!producto.disponible || !Number.isSafeInteger(producto.stock) || producto.stock < 1) throw new Error('El producto no tiene stock disponible.');
        const carrito = obtenerCarrito();
        const item = carrito.find(i => i.idProducto === idProducto);
        if ((item?.cantidad || 0) >= producto.stock) throw new Error('Alcanzaste el límite de stock disponible.');
        if (item) item.cantidad++;
        else carrito.push({ idProducto, cantidad: 1 });
        if (Array.isArray(window.productos)) {
            const indice = window.productos.findIndex(p => p.id === idProducto);
            if (indice >= 0) window.productos[indice] = { id: idProducto, ...producto };
        }
        if (guardarCarrito(carrito)) { mostrarMensaje('Producto agregado al carrito.'); return true; }
    } catch (error) { mostrarMensaje(error.code ? 'No se pudo comprobar el stock. Revisa tu conexión.' : error.message); }
    return false;
}
function disminuirCantidad(id) {
    const carrito = obtenerCarrito();
    const item = carrito.find(p => p.idProducto === id);
    if (!item) return;
    if (item.cantidad > 1) { item.cantidad--; guardarCarrito(carrito); }
    else eliminarDelCarrito(id);
}
function eliminarDelCarrito(id) { guardarCarrito(obtenerCarrito().filter(p => p.idProducto !== id)); }
export function mostrarCarrito() {
    const contenedor = document.querySelector('#carrito');
    if (!contenedor) return;
    if (!sesionLista || !window.estadoProductos) { contenedor.textContent = 'Cargando carrito...'; actualizarCompra(false); return; }
    const carrito = obtenerCarrito();
    const productos = window.productos || [];
    let subtotal = 0;
    let valido = carrito.length > 0 && !window.estadoProductos.error;
    contenedor.replaceChildren();
    if (window.estadoProductos.error) {
        const aviso = document.createElement('p'); aviso.className = 'text-danger'; aviso.textContent = 'No se pudo consultar el catálogo. El carrito se conserva; recarga para continuar.'; contenedor.append(aviso);
    }
    if (!carrito.length) { try { sessionStorage.removeItem("gamerlab:continuar-compra"); } catch {} }
    if (!carrito.length) contenedor.innerHTML += '<div class="carrito-vacio"><span class="vacio-marca" aria-hidden="true">＋</span><h2 class="h3">Tu próximo equipo empieza aquí</h2><p class="text-secondary">Todavía no agregaste productos a tu carrito.</p><a href="catalogo.html" class="btn btn-primary">Ir al catálogo</a></div>';
    carrito.forEach(item => {
        const producto = productos.find(p => p.id === item.idProducto);
        const disponible = producto && producto.disponible && Number.isFinite(producto.precio) && item.cantidad <= producto.stock;
        if (!disponible) valido = false;
        const importe = producto ? Math.round(producto.precio * item.cantidad * 100) / 100 : 0;
        subtotal += importe;
        const fila = document.createElement('article'); fila.className = 'carrito-producto';
        fila.innerHTML = `<img class="carrito-imagen" src="${escaparHTML(imagenSegura(producto?.imagen))}" alt="${escaparHTML(producto?.nombre || 'Producto no disponible')}"><div class="carrito-detalle"><h2 class="h5"><a href="producto.html?id=${encodeURIComponent(item.idProducto)}">${escaparHTML(producto?.nombre || 'Producto no disponible')}</a></h2><p class="text-secondary small mb-3">USD ${Number(producto?.precio || 0).toFixed(2)} por unidad</p>${!disponible ? '<p class="text-danger small">Revisa la cantidad o quita este producto para continuar.</p>' : ''}<div class="carrito-controles"><div class="cantidad-control" role="group" aria-label="Cantidad de ${escaparHTML(producto?.nombre || 'producto')}"><button type="button" class="restar" aria-label="Reducir cantidad">−</button><span aria-live="polite">${item.cantidad}</span><button type="button" class="aumentar" aria-label="Aumentar cantidad" ${!producto?.disponible || item.cantidad >= producto?.stock || window.estadoProductos.error ? 'disabled' : ''}>+</button></div><button type="button" class="btn btn-link text-danger btn-sm eliminar">Quitar</button></div></div><strong class="carrito-importe">USD ${importe.toFixed(2)}</strong>`;
        fila.querySelector('.aumentar').addEventListener('click', async evento => { evento.currentTarget.disabled = true; await agregarAlCarrito(item.idProducto); mostrarCarrito(); });
        fila.querySelector('.restar').addEventListener('click', () => { disminuirCantidad(item.idProducto); mostrarCarrito(); });
        fila.querySelector('.eliminar').addEventListener('click', () => { eliminarDelCarrito(item.idProducto); mostrarCarrito(); });
        contenedor.append(fila);
    });
    const envio = subtotal > 0 && subtotal < 500 ? 20 : 0;
    document.querySelector('#subtotalCarrito').textContent = subtotal.toFixed(2);
    document.querySelector('#costoEnvio').textContent = envio ? `USD ${envio.toFixed(2)}` : 'USD 0.00';
    document.querySelector('#totalCarrito').textContent = (subtotal + envio).toFixed(2);
    actualizarCompra(valido);
}
function actualizarCompra(valido) {
    const boton = document.querySelector('#confirmarCompra');
    if (boton) boton.disabled = !valido || Boolean(window.compraEnCurso);
}
onAuthStateChanged(auth, usuario => {
    uidCarrito = usuario?.uid || null;
    sesionLista = true;
    resolverSesion();
    actualizarContadorCarrito();
    mostrarCarrito();
    window.dispatchEvent(new Event('carritoSesionCambiada'));
}, () => { uidCarrito = null; sesionLista = true; resolverSesion(); actualizarContadorCarrito(); mostrarCarrito(); });
window.addEventListener('storage', evento => { if (evento.key === claveCarritoActual() || evento.key === null) { actualizarContadorCarrito(); mostrarCarrito(); } });
window.addEventListener('productosCargados', mostrarCarrito);
Object.assign(window, { obtenerCarrito, guardarCarrito, agregarAlCarrito, mostrarMensaje, actualizarContadorCarrito, mostrarCarrito });
mostrarCarrito();
export async function esperarCarritoDe(uid) {
    await sesionCarritoLista;
    if (!uid) throw new Error('Inicia sesión para continuar.');
    if (uidCarrito === uid) return;
    await new Promise((resolve, reject) => {
        let quitar;
        const limite = setTimeout(() => { quitar?.(); reject(new Error('No se pudo recuperar tu selección. Recarga la página.')); }, 10000);
        quitar = onAuthStateChanged(auth, usuario => {
            if (usuario?.uid === uid && uidCarrito === uid) { clearTimeout(limite); quitar?.(); resolve(); }
        });
    });
}
