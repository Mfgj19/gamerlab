import { escaparHTML, imagenSegura } from "./seguridad.js";
import { agregarAlCarrito } from "./carrito.js";
export function tarjetasProductos(productos, nivel = 'h2') {
    return productos.map(producto => {
        const disponible = producto.disponible && producto.stock > 0;
        return `<div class="col-md-6 col-xl-4"><article class="lab-product h-100"><a class="lab-product-image" href="producto.html?id=${encodeURIComponent(producto.id)}" aria-label="Ver ${escaparHTML(producto.nombre)}"><img src="${escaparHTML(imagenSegura(producto.imagen))}" alt="${escaparHTML(producto.nombre)}" loading="lazy"><span class="lab-product-tag ${disponible ? '' : 'sin-stock'}">${disponible ? 'Disponible' : 'Sin stock'}</span></a><div class="lab-product-body"><span class="eyebrow">${escaparHTML(producto.categoria)}</span><${nivel} class="h4"><a href="producto.html?id=${encodeURIComponent(producto.id)}">${escaparHTML(producto.nombre)}</a></${nivel}><p class="lab-product-description">${escaparHTML(producto.descripcion)}</p><div class="lab-product-price"><strong>USD ${Number(producto.precio).toLocaleString('es-UY',{minimumFractionDigits:2,maximumFractionDigits:2})}</strong><span>${producto.stock} unidades</span></div><div class="lab-product-actions"><a href="producto.html?id=${encodeURIComponent(producto.id)}" class="btn btn-outline-primary">Ver producto</a><button type="button" class="btn btn-primary agregar-carrito" data-id="${escaparHTML(producto.id)}" ${disponible ? '' : 'disabled'}>${disponible ? 'Agregar al carrito' : 'Sin stock'}</button></div></div></article></div>`;
    }).join('');
}
export function activarBotonesCarrito(contenedor) {
    contenedor.querySelectorAll('.agregar-carrito').forEach(boton => boton.addEventListener('click', async () => {
        boton.disabled = true;
        try { await agregarAlCarrito(boton.dataset.id); } finally { boton.disabled = false; }
    }));
}
