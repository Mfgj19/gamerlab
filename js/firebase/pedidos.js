import { auth, db } from './config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { collection, doc, getDocs, query, runTransaction, serverTimestamp, where } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import { validarCarrito, escaparHTML } from '../seguridad.js';
import { sesionCarritoLista, claveCarritoActual, obtenerCarrito, guardarCarrito, mostrarCarrito } from '../carrito.js';

const botonConfirmar = document.querySelector('#confirmarCompra');
const estadoCompra = document.querySelector('#estadoCompra');
const listaPedidos = document.querySelector('#listaPedidos');
let consultaPedidos = 0;
const dinero = valor => Number(valor || 0).toFixed(2);
function informar(mensaje) { window.mostrarMensaje?.(mensaje); if (estadoCompra) estadoCompra.textContent = mensaje; }
export async function registrarPedido(datosCarrito) {
    const usuario = auth.currentUser;
    if (!usuario) throw new Error('Inicia sesión para confirmar la compra.');
    const carrito = validarCarrito(datosCarrito);
    if (!carrito.length) throw new Error('El carrito está vacío.');
    if (carrito.length > 8) throw new Error('Puedes comprar hasta ocho productos distintos por pedido. Divide la selección en dos compras.');
    const referenciaPedido = doc(collection(db, 'pedidos'));
    return runTransaction(db, async transaccion => {
        if (auth.currentUser?.uid !== usuario.uid) throw new Error('La sesión cambió. Vuelve a ingresar antes de comprar.');
        const perfil = await transaccion.get(doc(db, 'usuarios', usuario.uid));
        if (!perfil.exists() || perfil.data().activo === false) throw new Error('Esta cuenta no puede realizar compras.');
        const actuales = [];
        for (const item of carrito) {
            const referencia = doc(db, 'productos', item.idProducto);
            const snapshot = await transaccion.get(referencia);
            if (!snapshot.exists()) throw new Error('Uno de los productos ya no existe. Revisa el carrito.');
            const datos = snapshot.data();
            if (!datos.disponible || !Number.isSafeInteger(datos.stock) || datos.stock < item.cantidad) throw new Error('Stock insuficiente: ' + datos.nombre + '. Revisa el carrito.');
            if (!Number.isFinite(datos.precio) || datos.precio < 0) throw new Error('No se pudo comprobar el precio de un producto.');
            actuales.push({ referencia, item, datos });
        }
        if (auth.currentUser?.uid !== usuario.uid) throw new Error('La sesión cambió. Vuelve a ingresar antes de comprar.');
        const cantidades = {};
        const productos = actuales.map(({ item, datos }) => {
            cantidades[item.idProducto] = item.cantidad;
            return { productoId: item.idProducto, nombre: datos.nombre, cantidad: item.cantidad, precio: datos.precio, subtotal: Math.round(datos.precio * item.cantidad * 100) / 100 };
        });
        const subtotal = Math.round(productos.reduce((s, p) => s + p.subtotal, 0) * 100) / 100;
        const envio = subtotal >= 500 ? 0 : 20;
        const total = Math.round((subtotal + envio) * 100) / 100;
        transaccion.set(referenciaPedido, { usuarioId: usuario.uid, usuarioNombre: perfil.data().nombre, usuarioEmail: usuario.email, productos, cantidades, subtotal, envio, total, fecha: serverTimestamp(), estado: 'confirmado' });
        actuales.forEach(({ referencia, item, datos }) => {
            const stock = datos.stock - item.cantidad;
            transaccion.update(referencia, { stock, disponible: stock > 0, ultimoPedido: referenciaPedido.id });
        });
        return { id: referenciaPedido.id, total };
    });
}
function mostrarPedidos(pedidos) {
    if (!listaPedidos) return;
    listaPedidos.innerHTML = pedidos.length ? pedidos.map(pedido => `<article class="border rounded p-3 mb-3"><div class="d-flex justify-content-between gap-3 flex-wrap mb-2"><strong>Pedido ${escaparHTML(pedido.id)}</strong><span class="badge text-bg-info text-capitalize">${escaparHTML(pedido.estado)}</span></div><p class="text-secondary small mb-2">${escaparHTML(pedido.fecha?.toDate ? pedido.fecha.toDate().toLocaleString('es-UY') : 'Registrado recientemente')}</p><ul class="mb-3">${(pedido.productos || []).map(p => `<li>${escaparHTML(p.nombre)} · ${Number(p.cantidad)} × USD ${dinero(p.precio)}</li>`).join('')}</ul><p class="mb-0"><strong>Total:</strong> USD ${dinero(pedido.total)}</p></article>`).join('') : '<p class="text-secondary mb-0">Todavía no realizaste ninguna compra.</p>';
}
async function cargarPedidos(usuario) {
    const revision = ++consultaPedidos;
    if (!listaPedidos) return;
    listaPedidos.textContent = 'Cargando pedidos...';
    try {
        const resultado = await getDocs(query(collection(db, 'pedidos'), where('usuarioId', '==', usuario.uid)));
        if (revision !== consultaPedidos || auth.currentUser?.uid !== usuario.uid) return;
        const pedidos = resultado.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.fecha?.toMillis?.() || 0) - (a.fecha?.toMillis?.() || 0));
        mostrarPedidos(pedidos);
    } catch {
        if (revision === consultaPedidos && auth.currentUser?.uid === usuario.uid) listaPedidos.textContent = 'No se pudieron cargar tus pedidos. Revisa la conexión.';
    }
}
async function confirmarCompra() {
    await sesionCarritoLista;
    if (window.compraEnCurso) return;
    if (!auth.currentUser) {
        try { sessionStorage.setItem('gamerlab:continuar-compra', 'si'); } catch { /* El acceso sigue disponible sin almacenamiento de sesión. */ }
        window.location.href = 'perfil.html';
        return;
    }
    if (window.estadoProductos?.error) { informar('Recarga el catálogo para comprobar los productos antes de comprar.'); return; }
    const clave = claveCarritoActual();
    window.compraEnCurso = true;
    const controles = document.querySelectorAll('#carrito button, #confirmarCompra');
    controles.forEach(b => b.disabled = true);
    informar('Comprobando productos y confirmando compra...');
    try {
        const pedido = await registrarPedido(obtenerCarrito());
        const vaciado = guardarCarrito([], clave);
        if (clave !== claveCarritoActual()) return;
        informar(vaciado ? `Pedido ${pedido.id} confirmado. Total: USD ${dinero(pedido.total)}. Puedes consultarlo en tu perfil.` : `Pedido ${pedido.id} confirmado. No se pudo vaciar el carrito; quita sus productos antes de volver a comprar.`);
        try { await window.recargarProductos?.(); } catch { /* El catálogo muestra su propio estado de error. */ }
    } catch (error) {
        if (clave === claveCarritoActual()) informar(error.code ? 'No se pudo registrar el pedido. Revisa el catálogo y la conexión. El carrito se conserva.' : error.message);
    } finally {
        window.compraEnCurso = false;
        controles.forEach(b => b.disabled = false);
        mostrarCarrito();
    }
}
botonConfirmar?.addEventListener('click', confirmarCompra);
onAuthStateChanged(auth, usuario => {
    if (estadoCompra && !window.compraEnCurso) estadoCompra.textContent = usuario ? '' : 'Inicia sesión para comprar.';
    if (!listaPedidos) return;
    if (usuario) cargarPedidos(usuario);
    else { consultaPedidos++; listaPedidos.replaceChildren(); }
});
