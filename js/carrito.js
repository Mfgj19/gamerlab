function obtenerCarrito() {

    return JSON.parse(
        localStorage.getItem("carrito")
    ) || [];

}

function guardarCarrito(carrito) {

    localStorage.setItem(
        "carrito",
        JSON.stringify(carrito)
    );

    actualizarContadorCarrito();
}

function mostrarMensaje(mensaje) {

    const toastElemento = document.querySelector("#appToast");
    const toastMensaje = document.querySelector("#toastMessage");

    if (toastElemento && toastMensaje) {

        toastMensaje.textContent = mensaje;

        const toast = new bootstrap.Toast(toastElemento);

        toast.show();
    }
}

function agregarAlCarrito(idProducto) {

    const carrito = obtenerCarrito();

    const producto = productos.find(
        producto => producto.id === idProducto
    );

    const item = carrito.find(
        item => item.idProducto === idProducto
    );

    if (item) {

        if (item.cantidad < producto.stock) {

            item.cantidad++;

            guardarCarrito(carrito);

            mostrarMensaje("Producto agregado al carrito.");

        } else {

            mostrarMensaje("No hay más stock disponible.");

        }

    } else {

        carrito.push({
            idProducto: idProducto,
            cantidad: 1
        });

        guardarCarrito(carrito);

        mostrarMensaje("Producto agregado al carrito.");

    }
}

function aumentarCantidad(idProducto) {

    const carrito = obtenerCarrito();

    const item = carrito.find(
        item => item.idProducto === idProducto
    );

    const producto = productos.find(
        producto => producto.id === idProducto
    );

    if (item.cantidad < producto.stock) {
        item.cantidad++;
    }

    guardarCarrito(carrito);
}
function disminuirCantidad(idProducto) {

    const carrito = obtenerCarrito();

    const item = carrito.find(
        item => item.idProducto === idProducto
    );

    if (item.cantidad > 1) {

        item.cantidad--;

        guardarCarrito(carrito);

    } else {

        eliminarDelCarrito(idProducto);

    }
}

function eliminarDelCarrito(idProducto) {

    let carrito = obtenerCarrito();

    carrito = carrito.filter(
        item => item.idProducto !== idProducto
    );

    guardarCarrito(carrito);
}

function actualizarContadorCarrito() {

    const carrito = obtenerCarrito();

    const contador = document.querySelector("#contadorCarrito");

    if (contador) {

        const cantidadTotal = carrito.reduce(
            (total, item) => total + item.cantidad,
            0
        );

        contador.textContent = cantidadTotal;
    }
}

function calcularSubtotal(producto, cantidad) {

    return producto.precio * cantidad;
}

function calcularTotal() {

    const carrito = obtenerCarrito();

    return carrito.reduce((total, item) => {

        const producto = productos.find(
            producto => producto.id === item.idProducto
        );

        return total + calcularSubtotal(
            producto,
            item.cantidad
        );

    }, 0);
}

function calcularEnvio(subtotal) {

    if (subtotal >= 500) {
        return 0;
    }

    return 20;
}

function mostrarCarrito() {

    const carrito = obtenerCarrito();

    const contenedor = document.querySelector("#carrito");

    const totalCarrito = document.querySelector("#totalCarrito");

    const subtotalCarrito = document.querySelector("#subtotalCarrito");

    const costoEnvio = document.querySelector("#costoEnvio");

    contenedor.innerHTML = "";

    if (carrito.length === 0) {

        contenedor.innerHTML = `
            <div class="text-center">
                <p class="text-secondary">
                    El carrito está vacío.
                </p>
                <a href="catalogo.html" class="btn btn-primary">
                    Ir al catálogo
                </a>
            </div>
        `;

        totalCarrito.textContent = 0;
        subtotalCarrito.textContent = 0;
        costoEnvio.textContent = "USD 0";

        return;
    }

    carrito.forEach((item) => {

        const producto = productos.find(
            producto => producto.id === item.idProducto
        );

        const subtotal = calcularSubtotal(
            producto,
            item.cantidad
        );

        contenedor.innerHTML += `
            <div class="border rounded p-3 mb-3">

                <h2 class="h5">${producto.nombre}</h2>

                <p class="mb-1">
                    Precio: USD ${producto.precio}
                </p>

                <p class="mb-1">
                    Cantidad: ${item.cantidad}
                </p>

                <p class="mb-3">
                    Subtotal: USD ${subtotal}
                </p>
                
                <a
                    href="producto.html?id=${producto.id}"
                    class="btn btn-primary btn-sm"
                >
                    Ver producto
                </a>
                
                <button
                    class="btn btn-outline-primary btn-sm aumentar"
                    data-id="${item.idProducto}"
                >
                +
                </button>
                
                <button
                    class="btn btn-outline-primary btn-sm restar"
                    data-id="${item.idProducto}"
                >
                    -
                </button>

                <button
                    class="btn btn-outline-danger btn-sm eliminar"
                    data-id="${item.idProducto}"
                >
                    Eliminar
                </button>

            </div>
        `;
    });
    document.querySelectorAll(".aumentar").forEach((boton) => {

        boton.addEventListener("click", () => {

            aumentarCantidad(boton.dataset.id);

            mostrarCarrito();
        });
    });

    document.querySelectorAll(".restar").forEach((boton) => {

        boton.addEventListener("click", () => {

            disminuirCantidad(boton.dataset.id);

            mostrarCarrito();
        });
    });

    document.querySelectorAll(".eliminar").forEach((boton) => {

        boton.addEventListener("click", () => {

            eliminarDelCarrito(boton.dataset.id);

            mostrarCarrito();
        });
    });
    const subtotalGeneral = calcularTotal();

    const envio = calcularEnvio(subtotalGeneral);

    const totalFinal = subtotalGeneral + envio;

    subtotalCarrito.textContent = subtotalGeneral;

    if (envio === 0) {
        costoEnvio.textContent = "Gratis";
    } else {
        costoEnvio.textContent = `USD ${envio}`;
    }

    totalCarrito.textContent = totalFinal;
}

if (document.querySelector("#carrito")) {
    mostrarCarrito();
}
actualizarContadorCarrito();