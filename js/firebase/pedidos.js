import { auth, db } from "./config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    collection,
    doc,
    getDocs,
    query,
    runTransaction,
    serverTimestamp,
    where
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


const botonConfirmar = document.querySelector("#confirmarCompra");
const estadoCompra = document.querySelector("#estadoCompra");
const listaPedidos = document.querySelector("#listaPedidos");


function informar(mensaje) {
    if (typeof window.mostrarMensaje === "function") {
        window.mostrarMensaje(mensaje);
    }

    if (estadoCompra) {
        estadoCompra.textContent = mensaje;
    }
}


function formatoFecha(fecha) {
    if (!fecha) {
        return "Registrado recientemente";
    }

    return fecha.toDate().toLocaleString("es-UY");
}


function mostrarPedidos(pedidos) {
    if (!listaPedidos) {
        return;
    }

    if (pedidos.length === 0) {
        listaPedidos.innerHTML = `
            <p class="text-secondary mb-0">Todavía no realizaste ninguna compra.</p>
        `;
        return;
    }

    listaPedidos.innerHTML = pedidos.map((pedido) => `
        <article class="border rounded p-3 mb-3">
            <div class="d-flex justify-content-between gap-3 flex-wrap mb-2">
                <strong>Pedido ${pedido.id}</strong>
                <span class="badge text-bg-info text-capitalize">${pedido.estado}</span>
            </div>
            <p class="text-secondary small mb-2">${formatoFecha(pedido.fecha)}</p>
            <ul class="mb-3">
                ${pedido.productos.map((producto) => `
                    <li>${producto.nombre} · ${producto.cantidad} × USD ${producto.precio}</li>
                `).join("")}
            </ul>
            <p class="mb-0"><strong>Total:</strong> USD ${pedido.total}</p>
        </article>
    `).join("");
}


async function cargarPedidos(usuario) {
    if (!listaPedidos) {
        return;
    }

    listaPedidos.innerHTML = `<p class="text-secondary mb-0">Cargando pedidos...</p>`;

    try {
        const consulta = query(
            collection(db, "pedidos"),
            where("usuarioId", "==", usuario.uid)
        );
        const resultado = await getDocs(consulta);
        const pedidos = resultado.docs.map((documento) => ({
            id: documento.id,
            ...documento.data()
        }));

        pedidos.sort((a, b) => {
            const fechaA = a.fecha?.toMillis() || 0;
            const fechaB = b.fecha?.toMillis() || 0;
            return fechaB - fechaA;
        });

        mostrarPedidos(pedidos);
    } catch (error) {
        console.error(error);
        listaPedidos.innerHTML = `
            <p class="text-danger mb-0">No se pudieron cargar tus pedidos.</p>
        `;
    }
}


async function confirmarCompra() {
    const usuario = auth.currentUser;

    if (!usuario) {
        informar("Iniciá sesión para confirmar la compra.");
        return;
    }

    const carrito = window.obtenerCarrito();

    if (carrito.length === 0) {
        informar("El carrito está vacío.");
        return;
    }

    botonConfirmar.disabled = true;
    estadoCompra.textContent = "Confirmando compra...";

    try {
        await runTransaction(db, async (transaccion) => {
            const productosActuales = [];

            for (const item of carrito) {
                const referenciaProducto = doc(db, "productos", item.idProducto);
                const documentoProducto = await transaccion.get(referenciaProducto);

                if (!documentoProducto.exists()) {
                    throw new Error("Uno de los productos ya no existe.");
                }

                productosActuales.push({
                    referencia: referenciaProducto,
                    item: item,
                    datos: documentoProducto.data()
                });
            }

            const productosPedido = productosActuales.map(({ item, datos }) => {
                if (!datos.disponible || datos.stock < item.cantidad) {
                    throw new Error(`No hay stock suficiente de ${datos.nombre}.`);
                }

                return {
                    productoId: item.idProducto,
                    nombre: datos.nombre,
                    cantidad: item.cantidad,
                    precio: datos.precio,
                    subtotal: datos.precio * item.cantidad
                };
            });

            const subtotal = productosPedido.reduce(
                (total, producto) => total + producto.subtotal,
                0
            );
            const envio = subtotal >= 500 ? 0 : 20;
            const total = subtotal + envio;
            const referenciaPedido = doc(collection(db, "pedidos"));

            transaccion.set(referenciaPedido, {
                usuarioId: usuario.uid,
                usuarioNombre: usuario.displayName || "Cliente",
                usuarioEmail: usuario.email,
                productos: productosPedido,
                subtotal: subtotal,
                envio: envio,
                total: total,
                fecha: serverTimestamp(),
                estado: "confirmado"
            });

            productosActuales.forEach(({ referencia, item, datos }) => {
                const nuevoStock = datos.stock - item.cantidad;

                transaccion.update(referencia, {
                    stock: nuevoStock,
                    disponible: nuevoStock > 0
                });
            });
        });

        localStorage.removeItem("carrito");
        window.actualizarContadorCarrito();
        window.mostrarCarrito();
        informar("Compra confirmada correctamente.");
    } catch (error) {
        console.error(error);
        informar(error.message || "No se pudo confirmar la compra.");
    } finally {
        botonConfirmar.disabled = false;
    }
}


botonConfirmar?.addEventListener("click", confirmarCompra);


onAuthStateChanged(auth, (usuario) => {
    if (botonConfirmar) {
        estadoCompra.textContent = usuario
            ? ""
            : "Necesitás iniciar sesión para comprar.";
    }

    if (listaPedidos) {
        if (usuario) {
            cargarPedidos(usuario);
        } else {
            listaPedidos.innerHTML = "";
        }
    }
});
