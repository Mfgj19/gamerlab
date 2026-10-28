import { auth, db } from "./config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    serverTimestamp,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


const formProducto = document.querySelector("#formProducto");
const productoId = document.querySelector("#productoId");
const productoNombre = document.querySelector("#productoNombre");
const productoCategoria = document.querySelector("#productoCategoria");
const productoPrecio = document.querySelector("#productoPrecio");
const productoStock = document.querySelector("#productoStock");
const productoDescripcion = document.querySelector("#productoDescripcion");
const productoImagen = document.querySelector("#productoImagen");
const productoDisponible = document.querySelector("#productoDisponible");
const guardarProducto = document.querySelector("#guardarProducto");
const cancelarEdicion = document.querySelector("#cancelarEdicion");
const formProductoTitulo = document.querySelector("#formProductoTitulo");
const ayudaFormProducto = document.querySelector("#ayudaFormProducto");
const resultadoProducto = document.querySelector("#resultadoProducto");
const estadoProductosAdmin = document.querySelector("#estadoProductosAdmin");
const contenedorTablaProductos = document.querySelector("#contenedorTablaProductos");
const listaProductosAdmin = document.querySelector("#listaProductosAdmin");
const cantidadProductosAdmin = document.querySelector("#cantidadProductosAdmin");

let productosAdmin = [];
let panelIniciado = false;


function escaparTexto(valor) {
    const elemento = document.createElement("div");
    elemento.textContent = String(valor ?? "");
    return elemento.innerHTML;
}


function mostrarResultado(mensaje, esError = false) {
    resultadoProducto.textContent = mensaje;
    resultadoProducto.className = `small mt-3 mb-0 ${esError ? "text-danger" : "text-success"}`;

    if (typeof window.mostrarMensaje === "function") {
        window.mostrarMensaje(mensaje);
    }
}


function actualizarModoFormulario(producto = null) {
    formProducto.reset();
    formProducto.classList.remove("was-validated");
    resultadoProducto.textContent = "";
    [productoNombre, productoCategoria, productoPrecio, productoStock, productoDescripcion, productoImagen]
        .forEach((campo) => campo.setCustomValidity(""));

    if (!producto) {
        productoId.value = "";
        productoDisponible.checked = true;
        formProductoTitulo.textContent = "Crear producto";
        ayudaFormProducto.textContent = "Completá los datos para agregar un producto al catálogo.";
        guardarProducto.textContent = "Guardar producto";
        cancelarEdicion.classList.add("d-none");
        return;
    }

    productoId.value = producto.id;
    productoNombre.value = producto.nombre || "";
    productoCategoria.value = producto.categoria || "";
    productoPrecio.value = producto.precio ?? "";
    productoStock.value = producto.stock ?? "";
    productoDescripcion.value = producto.descripcion || "";
    productoImagen.value = producto.imagen || "";
    productoDisponible.checked = Boolean(producto.disponible);
    formProductoTitulo.textContent = "Editar producto";
    ayudaFormProducto.textContent = `Estás modificando “${producto.nombre}”.`;
    guardarProducto.textContent = "Guardar cambios";
    cancelarEdicion.classList.remove("d-none");
    formProducto.scrollIntoView({ behavior: "smooth", block: "start" });
}


function mostrarProductos() {
    cantidadProductosAdmin.textContent = productosAdmin.length === 1
        ? "1 producto"
        : `${productosAdmin.length} productos`;

    if (productosAdmin.length === 0) {
        estadoProductosAdmin.textContent = "Todavía no hay productos registrados en Firestore.";
        estadoProductosAdmin.classList.remove("d-none");
        contenedorTablaProductos.classList.add("d-none");
        listaProductosAdmin.innerHTML = "";
        return;
    }

    listaProductosAdmin.innerHTML = productosAdmin.map((producto) => `
        <tr>
            <td><strong>${escaparTexto(producto.nombre)}</strong></td>
            <td>${escaparTexto(producto.categoria)}</td>
            <td>USD ${Number(producto.precio).toFixed(2)}</td>
            <td>${Number(producto.stock)}</td>
            <td>
                <span class="admin-product-status ${producto.disponible ? "is-available" : "is-unavailable"}">
                    ${producto.disponible ? "Disponible" : "No disponible"}
                </span>
            </td>
            <td class="text-end">
                <button class="btn btn-outline-primary btn-sm editar-producto" type="button" data-id="${escaparTexto(producto.id)}">
                    Editar
                </button>
            </td>
        </tr>
    `).join("");

    estadoProductosAdmin.classList.add("d-none");
    contenedorTablaProductos.classList.remove("d-none");

    document.querySelectorAll(".editar-producto").forEach((boton) => {
        boton.addEventListener("click", () => {
            const producto = productosAdmin.find((item) => item.id === boton.dataset.id);

            if (producto) {
                actualizarModoFormulario(producto);
            }
        });
    });
}


async function cargarProductosAdmin() {
    estadoProductosAdmin.textContent = "Cargando productos...";
    estadoProductosAdmin.classList.remove("d-none", "text-danger");
    contenedorTablaProductos.classList.add("d-none");

    try {
        const resultado = await getDocs(collection(db, "productos"));
        productosAdmin = resultado.docs.map((documento) => ({
            id: documento.id,
            ...documento.data()
        }));

        productosAdmin.sort((a, b) => String(a.nombre).localeCompare(String(b.nombre), "es"));
        mostrarProductos();
    } catch (error) {
        console.error(error);
        estadoProductosAdmin.textContent = "No se pudieron cargar los productos desde Firestore.";
        estadoProductosAdmin.classList.add("text-danger");
    }
}


function validarFormulario() {
    const precio = Number(productoPrecio.value);
    const stock = Number(productoStock.value);

    productoNombre.setCustomValidity(productoNombre.value.trim() ? "" : "Ingresá el nombre del producto.");
    productoCategoria.setCustomValidity(productoCategoria.value.trim() ? "" : "Ingresá una categoría.");
    productoDescripcion.setCustomValidity(productoDescripcion.value.trim() ? "" : "Ingresá una descripción.");
    productoImagen.setCustomValidity(productoImagen.value.trim() ? "" : "Ingresá una imagen.");
    productoPrecio.setCustomValidity(
        productoPrecio.value === "" || !Number.isFinite(precio) || precio < 0
            ? "Ingresá un precio válido."
            : ""
    );
    productoStock.setCustomValidity(
        productoStock.value === "" || !Number.isInteger(stock) || stock < 0
            ? "Ingresá un stock válido."
            : ""
    );

    formProducto.classList.add("was-validated");
    return formProducto.checkValidity();
}


function obtenerDatosFormulario() {
    const stock = Number(productoStock.value);

    return {
        nombre: productoNombre.value.trim(),
        categoria: productoCategoria.value.trim(),
        precio: Number(productoPrecio.value),
        stock,
        descripcion: productoDescripcion.value.trim(),
        imagen: productoImagen.value.trim(),
        disponible: productoDisponible.checked && stock > 0,
        actualizadoEn: serverTimestamp()
    };
}


async function guardarDatosProducto(evento) {
    evento.preventDefault();

    if (!validarFormulario()) {
        mostrarResultado("Revisá los campos marcados antes de guardar.", true);
        return;
    }

    const idActual = productoId.value;
    const datos = obtenerDatosFormulario();

    guardarProducto.disabled = true;
    cancelarEdicion.disabled = true;
    guardarProducto.textContent = idActual ? "Guardando cambios..." : "Creando producto...";
    resultadoProducto.textContent = "Procesando la operación...";
    resultadoProducto.className = "small mt-3 mb-0 text-secondary";

    try {
        let mensajeExito;

        if (idActual) {
            await updateDoc(doc(db, "productos", idActual), datos);
            mensajeExito = "Producto actualizado correctamente.";
        } else {
            await addDoc(collection(db, "productos"), {
                ...datos,
                imagenes: [datos.imagen],
                caracteristicas: []
            });
            mensajeExito = "Producto creado correctamente.";
        }

        await cargarProductosAdmin();
        actualizarModoFormulario();
        mostrarResultado(mensajeExito);
    } catch (error) {
        console.error(error);
        mostrarResultado("No se pudo guardar el producto. Intentá nuevamente.", true);
    } finally {
        guardarProducto.disabled = false;
        cancelarEdicion.disabled = false;
        guardarProducto.textContent = productoId.value ? "Guardar cambios" : "Guardar producto";
    }
}


formProducto.addEventListener("submit", guardarDatosProducto);
cancelarEdicion.addEventListener("click", () => actualizarModoFormulario());


onAuthStateChanged(auth, async (usuario) => {
    if (!usuario || panelIniciado) {
        return;
    }

    try {
        const documentoUsuario = await getDoc(doc(db, "usuarios", usuario.uid));
        const rol = String(documentoUsuario.data()?.rol || "cliente").toLowerCase();

        if (rol === "administrador") {
            panelIniciado = true;
            await cargarProductosAdmin();
        }
    } catch (error) {
        console.error(error);
        estadoProductosAdmin.textContent = "No fue posible iniciar la gestión de productos.";
        estadoProductosAdmin.classList.add("text-danger");
    }
});
