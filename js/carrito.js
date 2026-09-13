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
        }

    } else {

        carrito.push({
            idProducto: idProducto,
            cantidad: 1
        });

    }

    guardarCarrito(carrito);
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

function mostrarCarrito() {

    const carrito = obtenerCarrito();

    const contenedor = document.querySelector("#carrito");

    const totalCarrito = document.querySelector("#totalCarrito");

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
    totalCarrito.textContent = calcularTotal();
}

if (document.querySelector("#carrito")) {
    mostrarCarrito();
}