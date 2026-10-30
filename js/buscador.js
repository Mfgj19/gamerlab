import './productos.js';
import { escaparHTML, imagenSegura } from './seguridad.js';
const campo = document.querySelector('#busquedaBarra');
const resultados = document.querySelector('#resultadosBarra');
const estado = document.querySelector('#estadoBusquedaBarra');
const normalizar = texto => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
let activo = -1;
function cerrar() { resultados.hidden = true; campo.setAttribute('aria-expanded', 'false'); campo.removeAttribute('aria-activedescendant'); activo = -1; }
function mostrar() {
    const texto = campo.value.trim(); activo = -1; campo.removeAttribute('aria-activedescendant');
    if (!texto) { cerrar(); estado.textContent = ''; return; }
    const encontrados = (window.productos || []).filter(p => normalizar(p.nombre).includes(normalizar(texto)));
    if (!window.estadoProductos) resultados.innerHTML = '<div class="search-message">Cargando productos…</div>';
    else if (window.estadoProductos.error) resultados.innerHTML = '<div class="search-message">No se pudo cargar el catálogo. Intenta recargar la página.</div>';
    else resultados.innerHTML = encontrados.length ? encontrados.slice(0,5).map((p,i) => `<a id="sugerencia-${i}" class="search-option" role="option" aria-selected="false" href="producto.html?id=${encodeURIComponent(p.id)}"><img src="${escaparHTML(imagenSegura(p.imagen))}" alt=""><span><strong>${escaparHTML(p.nombre)}</strong><small>${escaparHTML(p.categoria)}</small></span><b>USD ${Number(p.precio).toLocaleString('es-UY',{minimumFractionDigits:2,maximumFractionDigits:2})}</b></a>`).join('') + `<a role="option" aria-selected="false" id="sugerencia-todos" class="search-all" href="catalogo.html?q=${encodeURIComponent(texto)}">Ver todos los resultados (${encontrados.length}) ↗</a>` : '<div class="search-message">No encontramos productos con ese nombre.</div>';
    resultados.hidden = false; campo.setAttribute('aria-expanded','true');
    estado.textContent = window.estadoProductos && !window.estadoProductos.error ? (encontrados.length === 1 ? '1 producto encontrado' : encontrados.length + ' productos encontrados') : 'Consultando catálogo';
}
campo.addEventListener('input', mostrar);
campo.addEventListener('focus', () => { if(campo.value.trim()) mostrar(); });
campo.addEventListener('keydown', evento => {
    if(evento.key === 'Escape') { cerrar(); return; }
    if(evento.key === 'ArrowDown' || evento.key === 'ArrowUp') {
        evento.preventDefault(); if(resultados.hidden) mostrar();
        const opciones = [...resultados.querySelectorAll('[role="option"]')]; if(!opciones.length) return;
        activo = (activo + (evento.key === 'ArrowDown' ? 1 : -1) + opciones.length) % opciones.length;
        opciones.forEach((opcion,i) => opcion.setAttribute('aria-selected',String(i===activo)));
        campo.setAttribute('aria-activedescendant',opciones[activo].id); opciones[activo].scrollIntoView({block:'nearest'});
    } else if(evento.key === 'Enter' && !resultados.hidden && activo >= 0) {
        evento.preventDefault(); resultados.querySelectorAll('[role="option"]')[activo]?.click();
    }
});
document.addEventListener('click', evento => { if(!campo.closest('form').contains(evento.target)) cerrar(); });
campo.closest('form').addEventListener('focusout', evento => { if(!campo.closest('form').contains(evento.relatedTarget)) cerrar(); });
window.addEventListener('productosCargados', () => { if(document.activeElement === campo) mostrar(); });
