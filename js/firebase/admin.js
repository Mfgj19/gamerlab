import { escaparHTML, imagenSegura } from "../seguridad.js";
import { auth, db } from "./config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import {
    addDoc, collection, doc, getDoc, getDocs, serverTimestamp, updateDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const $ = (selector) => document.querySelector(selector);
const formProducto = $("#formProducto");
const camposProducto = {
    id: $("#productoId"), nombre: $("#productoNombre"), categoria: $("#productoCategoria"),
    precio: $("#productoPrecio"), stock: $("#productoStock"), descripcion: $("#productoDescripcion"),
    imagen: $("#productoImagen"), imagen2: $("#productoImagen2"), imagen3: $("#productoImagen3"),
    caracteristicas: $("#productoCaracteristicas"), disponible: $("#productoDisponible")
};
let productosAdmin = [];
let usuarioAdministrador = null;
let panelIniciado = false;

function escaparTexto(valor) {
    return escaparHTML(valor);
}

function fechaLegible(fecha) {
    return fecha?.toDate ? fecha.toDate().toLocaleString("es-UY") : "Sin fecha";
}

function informar(mensaje, error = false) {
    $("#resultadoProducto").textContent = mensaje;
    $("#resultadoProducto").className = `small mt-3 mb-0 ${error ? "text-danger" : "text-success"}`;
    window.mostrarMensaje?.(mensaje);
}

function actualizarModoFormulario(producto = null) {
    formProducto.reset();
    formProducto.classList.remove("was-validated");
    $("#resultadoProducto").textContent = "";
    Object.values(camposProducto).filter((campo) => campo?.setCustomValidity).forEach((campo) => campo.setCustomValidity(""));
    if (!producto) {
        camposProducto.id.value = "";
        camposProducto.disponible.checked = true;
        $("#formProductoTitulo").textContent = "Crear producto";
        $("#ayudaFormProducto").textContent = "Completa los datos para agregar un producto al catálogo.";
        $("#guardarProducto").textContent = "Guardar producto";
        $("#cancelarEdicion").classList.add("d-none");
        return;
    }
    camposProducto.id.value = producto.id;
    camposProducto.nombre.value = producto.nombre || "";
    camposProducto.categoria.value = producto.categoria || "";
    camposProducto.precio.value = producto.precio ?? "";
    camposProducto.stock.value = producto.stock ?? "";
    camposProducto.descripcion.value = producto.descripcion || "";
    const imagenes = Array.isArray(producto.imagenes) ? producto.imagenes : [];
    camposProducto.imagen.value = imagenes[0] || producto.imagen || "";
    camposProducto.imagen2.value = imagenes[1] || "";
    camposProducto.imagen3.value = imagenes[2] || "";
    camposProducto.caracteristicas.value = Array.isArray(producto.caracteristicas)
        ? producto.caracteristicas.join("\n")
        : "";
    camposProducto.disponible.checked = producto.disponible !== false;
    $("#formProductoTitulo").textContent = "Editar producto";
    $("#ayudaFormProducto").textContent = `Estás modificando “${producto.nombre}”.`;
    $("#guardarProducto").textContent = "Guardar cambios";
    $("#cancelarEdicion").classList.remove("d-none");
    formProducto.scrollIntoView({ behavior: "smooth", block: "start" });
}

function mostrarProductos() {
    $("#cantidadProductosAdmin").textContent = `${productosAdmin.length} producto${productosAdmin.length === 1 ? "" : "s"}`;
    $("#estadisticaProductos").textContent = productosAdmin.filter((p) => p.disponible !== false).length;
    $("#estadisticaStock").textContent = productosAdmin.reduce((total, p) => total + Number(p.stock || 0), 0);
    if (!productosAdmin.length) {
        $("#estadoProductosAdmin").textContent = "Todavía no hay productos registrados en Firestore.";
        $("#contenedorTablaProductos").classList.add("d-none");
        return;
    }
    $("#listaProductosAdmin").innerHTML = productosAdmin.map((p) => `
        <tr><td><strong>${escaparTexto(p.nombre)}</strong></td><td>${escaparTexto(p.categoria)}</td>
        <td>USD ${Number(p.precio || 0).toFixed(2)}</td><td>${Number(p.stock || 0)}</td>
        <td><span class="admin-product-status ${p.disponible !== false ? "is-available" : "is-unavailable"}">${p.disponible !== false ? "Disponible" : "Desactivado"}</span></td>
        <td class="text-end"><div class="d-flex gap-2 justify-content-end">
            <button class="btn btn-outline-primary btn-sm editar-producto" data-id="${escaparTexto(p.id)}">Editar</button>
            <button class="btn btn-outline-${p.disponible !== false ? "danger" : "success"} btn-sm estado-producto" data-id="${escaparTexto(p.id)}">${p.disponible !== false ? "Desactivar" : "Activar"}</button>
        </div></td></tr>`).join("");
    $("#estadoProductosAdmin").classList.add("d-none");
    $("#contenedorTablaProductos").classList.remove("d-none");
    document.querySelectorAll(".editar-producto").forEach((b) => b.addEventListener("click", () => actualizarModoFormulario(productosAdmin.find((p) => p.id === b.dataset.id))));
    document.querySelectorAll(".estado-producto").forEach((b) => b.addEventListener("click", async () => { b.disabled = true; try { await cambiarEstadoProducto(b.dataset.id); } catch { informar("No se pudo cambiar la disponibilidad.", true); } finally { b.disabled = false; } }));
}

async function cargarProductos() {
    const resultado = await getDocs(collection(db, "productos"));
    productosAdmin = resultado.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => String(a.nombre).localeCompare(String(b.nombre), "es"));
    mostrarProductos();
}

async function cambiarEstadoProducto(id) {
    const producto = productosAdmin.find((p) => p.id === id);
    if (!producto) return;
    const activo = producto.disponible !== false;
    if (!confirm(`¿Quieres ${activo ? "desactivar" : "activar"} “${producto.nombre}”?`)) return;
    await updateDoc(doc(db, "productos", id), { disponible: !activo && Number(producto.stock) > 0, actualizadoEn: serverTimestamp() });
    await cargarProductos();
    informar(`Producto ${activo ? "desactivado" : "activado"} correctamente.`);
}

function validarFormulario() {
    const precio = Number(camposProducto.precio.value);
    const stock = Number(camposProducto.stock.value);
    camposProducto.nombre.setCustomValidity(camposProducto.nombre.value.trim() ? "" : "Ingresa el nombre.");
    camposProducto.categoria.setCustomValidity(camposProducto.categoria.value.trim() ? "" : "Ingresa una categoría.");
    camposProducto.descripcion.setCustomValidity(camposProducto.descripcion.value.trim() ? "" : "Ingresa una descripción.");
    camposProducto.imagen.setCustomValidity(camposProducto.imagen.value.trim() ? "" : "Ingresa la imagen principal.");
    camposProducto.imagen2.setCustomValidity(camposProducto.imagen2.value.trim() ? "" : "Ingresa la segunda imagen.");
    camposProducto.imagen3.setCustomValidity(camposProducto.imagen3.value.trim() ? "" : "Ingresa la tercera imagen.");
    camposProducto.caracteristicas.setCustomValidity(camposProducto.caracteristicas.value.trim() ? "" : "Ingresa al menos una característica.");
    camposProducto.precio.setCustomValidity(Number.isFinite(precio) && precio >= 0 && precio <= 1000000 && Math.abs(precio * 100 - Math.round(precio * 100)) < 0.001 ? "" : "Precio inválido.");
    camposProducto.stock.setCustomValidity(Number.isSafeInteger(stock) && stock >= 0 && stock <= 1000000 ? "" : "Stock inválido.");
    const vistas = [camposProducto.imagen, camposProducto.imagen2, camposProducto.imagen3];
    vistas.forEach(campo => campo.setCustomValidity(campo.value.trim() && imagenSegura(campo.value.trim()) === campo.value.trim() ? "" : "Usa una ruta de assets/img/ o un enlace HTTPS."));
    if (new Set(vistas.map(c => c.value.trim())).size !== vistas.length) camposProducto.imagen3.setCustomValidity("Las imágenes deben ser diferentes.");
    formProducto.classList.add("was-validated");
    return formProducto.checkValidity();
}

async function guardarProducto(evento) {
    evento.preventDefault();
    if ($("#guardarProducto").disabled) return;
    if (!validarFormulario()) return informar("Revisa los campos marcados antes de guardar.", true);
    const stock = Number(camposProducto.stock.value);
    const imagenes = [camposProducto.imagen.value, camposProducto.imagen2.value, camposProducto.imagen3.value]
        .map((imagen) => imagen.trim());
    const caracteristicas = camposProducto.caracteristicas.value
        .split("\n")
        .map((caracteristica) => caracteristica.trim())
        .filter(Boolean);
    const datos = { nombre: camposProducto.nombre.value.trim(), categoria: camposProducto.categoria.value.trim(), precio: Number(camposProducto.precio.value), stock,
        descripcion: camposProducto.descripcion.value.trim(), imagen: imagenes[0], imagenes, caracteristicas,
        disponible: camposProducto.disponible.checked && stock > 0, actualizadoEn: serverTimestamp() };
    $("#guardarProducto").disabled = true;
    try {
        if (camposProducto.id.value) await updateDoc(doc(db, "productos", camposProducto.id.value), datos);
        else await addDoc(collection(db, "productos"), datos);
        const eraEdicion = Boolean(camposProducto.id.value);
        await cargarProductos();
        actualizarModoFormulario();
        informar(eraEdicion ? "Producto actualizado correctamente." : "Producto guardado correctamente.");
    } catch (error) { console.error(error); informar("No se pudo guardar el producto.", true); }
    finally { $("#guardarProducto").disabled = false; }
}

async function cargarPedidos() {
    const resultado = await getDocs(collection(db, "pedidos"));
    const pedidos = resultado.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (b.fecha?.toMillis?.() || 0) - (a.fecha?.toMillis?.() || 0));
    $("#estadisticaPedidos").textContent = pedidos.length;
    $("#cantidadPedidosAdmin").textContent = `${pedidos.length} pedido${pedidos.length === 1 ? "" : "s"}`;
    $("#listaPedidosAdmin").innerHTML = pedidos.map((p) => `<tr><td><strong>${escaparTexto(p.id)}</strong><small>${p.productos?.length || 0} productos</small></td>
        <td>${escaparTexto(p.usuarioNombre || "Cliente")}<small>${escaparTexto(p.usuarioEmail || "")}</small></td><td>${fechaLegible(p.fecha)}</td>
        <td>USD ${Number(p.total || 0).toFixed(2)}</td><td><select class="form-select form-select-sm estado-pedido" data-id="${escaparTexto(p.id)}">
        ${["pendiente", "confirmado", "en preparación", "enviado", "entregado", "cancelado"].map((e) => `<option ${p.estado === e ? "selected" : ""}>${e}</option>`).join("")}</select></td></tr>`).join("");
    $("#estadoPedidosAdmin").classList.toggle("d-none", pedidos.length > 0);
    $("#estadoPedidosAdmin").textContent = pedidos.length ? "" : "Todavía no hay pedidos.";
    $("#contenedorPedidosAdmin").classList.toggle("d-none", !pedidos.length);
    document.querySelectorAll(".estado-pedido").forEach((s) => s.addEventListener("change", async () => {
        try { await updateDoc(doc(db, "pedidos", s.dataset.id), { estado: s.value, actualizadoEn: serverTimestamp() }); window.mostrarMensaje?.("Estado del pedido actualizado."); }
        catch (error) { console.error(error); window.mostrarMensaje?.("No se pudo actualizar el pedido."); await cargarPedidos(); }
    }));
}

async function cargarUsuarios() {
    const resultado = await getDocs(collection(db, "usuarios"));
    const usuarios = resultado.docs.map((d) => ({ id: d.id, ...d.data() }));
    $("#estadisticaUsuarios").textContent = usuarios.length;
    $("#cantidadUsuariosAdmin").textContent = `${usuarios.length} usuario${usuarios.length === 1 ? "" : "s"}`;
    $("#listaUsuariosAdmin").innerHTML = usuarios.map((u) => { const activo = u.activo !== false; const esActual = u.id === usuarioAdministrador.uid; return `<tr><td><strong>${escaparTexto(u.nombre || "Usuario")}</strong><small>${escaparTexto(u.email || "")}</small></td>
        <td><span class="badge text-bg-light">${escaparTexto(u.rol || "cliente")}</span></td><td>${activo ? "Activo" : "Desactivado"}</td><td><button class="btn btn-outline-${activo ? "danger" : "success"} btn-sm estado-usuario" data-id="${escaparTexto(u.id)}" data-activo="${activo}" ${esActual ? "disabled title=\"No puedes desactivar tu propia cuenta\"" : ""}>${activo ? "Desactivar" : "Activar"}</button></td></tr>`; }).join("");
    $("#estadoUsuariosAdmin").classList.toggle("d-none", usuarios.length > 0);
    $("#contenedorUsuariosAdmin").classList.toggle("d-none", !usuarios.length);
    document.querySelectorAll(".estado-usuario").forEach((b) => b.addEventListener("click", async () => {
        b.disabled = true;
        try { await updateDoc(doc(db, "usuarios", b.dataset.id), { activo: b.dataset.activo !== "true", actualizadoEn: serverTimestamp() }); await cargarUsuarios(); }
        catch { window.mostrarMensaje?.("No se pudo cambiar el estado del usuario."); b.disabled = false; }
    }));
}

async function cargarOpiniones() {
    const resultado = await getDocs(collection(db, "opiniones"));
    const opiniones = resultado.docs.map((d) => ({ id: d.id, ...d.data() }));
    $("#cantidadOpinionesAdmin").textContent = `${opiniones.length} comentario${opiniones.length === 1 ? "" : "s"}`;
    $("#listaOpinionesAdmin").innerHTML = opiniones.map((o) => { const visible = o.visible !== false; return `<article class="border rounded p-3"><div class="d-flex justify-content-between gap-2"><strong>${escaparTexto(o.usuarioNombre || o.usuarioEmail || "Usuario")}</strong><span>${"★".repeat(Number(o.puntuacion || 0))}</span></div><p class="my-2">${escaparTexto(o.comentario || "")}</p><button class="btn btn-outline-${visible ? "danger" : "success"} btn-sm estado-opinion" data-id="${escaparTexto(o.id)}" data-visible="${visible}">${visible ? "Ocultar" : "Mostrar"}</button></article>`; }).join("");
    $("#estadoOpinionesAdmin").classList.toggle("d-none", opiniones.length > 0);
    $("#estadoOpinionesAdmin").textContent = opiniones.length ? "" : "Todavía no hay comentarios.";
    $("#listaOpinionesAdmin").classList.toggle("d-none", !opiniones.length);
    document.querySelectorAll(".estado-opinion").forEach((b) => b.addEventListener("click", async () => {
        b.disabled = true;
        try { await updateDoc(doc(db, "opiniones", b.dataset.id), { visible: b.dataset.visible !== "true", moderadoEn: serverTimestamp() }); await cargarOpiniones(); }
        catch { window.mostrarMensaje?.("No se pudo cambiar la visibilidad del comentario."); b.disabled = false; }
    }));
}

async function iniciarPanel(usuario) {
    usuarioAdministrador = usuario;
    try { await Promise.all([cargarProductos(), cargarPedidos(), cargarUsuarios(), cargarOpiniones()]); }
    catch (error) { console.error(error); window.mostrarMensaje?.("Algunos datos administrativos no pudieron cargarse. Revisa las reglas de Firestore."); }
}

formProducto.addEventListener("submit", guardarProducto);
$("#cancelarEdicion").addEventListener("click", () => actualizarModoFormulario());
onAuthStateChanged(auth, async (usuario) => {
    if (!usuario || panelIniciado) return;
    try {
        const perfil = await getDoc(doc(db, "usuarios", usuario.uid));
        if (auth.currentUser?.uid !== usuario.uid) return;
        if (perfil.data()?.rol === "administrador" && perfil.data()?.activo !== false) { panelIniciado = true; await iniciarPanel(usuario); }
    } catch { window.mostrarMensaje?.("No se pudieron comprobar los permisos del panel. Revisa la conexión."); }
});
