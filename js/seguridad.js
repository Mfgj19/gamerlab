export function escaparHTML(valor) {
    return String(valor ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
export function imagenSegura(valor) {
    const ruta = String(valor ?? '').trim();
    return (/^https:\/\//i.test(ruta) || /^assets\/img\/(?!.*\.\.)[^\\]+$/i.test(ruta)) ? ruta : 'assets/img/logo/logo.png';
}
export function validarCarrito(valor) {
    if (!Array.isArray(valor)) throw new Error('El carrito guardado no es válido.');
    const ids = new Set();
    return valor.map(item => {
        if (!item || typeof item.idProducto !== 'string' || !/^[A-Za-z0-9_-]{1,150}$/.test(item.idProducto) || !Number.isSafeInteger(item.cantidad) || item.cantidad < 1 || item.cantidad > 1000000 || ids.has(item.idProducto)) throw new Error('El carrito contiene datos inválidos. Revisa los productos antes de continuar.');
        ids.add(item.idProducto);
        return { idProducto: item.idProducto, cantidad: item.cantidad };
    });
}
