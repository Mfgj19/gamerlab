const parametros = new URLSearchParams(window.location.search);

const id = parametros.get("id");

const producto = productos.find((producto) =>
    producto.id == id
);

const contenedor = document.querySelector("#detalleProducto");

if (producto) {

    contenedor.innerHTML = `
        <div class="row g-4 align-items-center">

            <div class="col-md-6">
                <img
                    src="${producto.imagen}"
                    alt="${producto.nombre}"
                    class="img-fluid"
                >
            </div>

            <div class="col-md-6">

                <span class="eyebrow">${producto.categoria}</span>

                <h1 class="mt-2">${producto.nombre}</h1>

                <p class="text-secondary">
                    ${producto.descripcion}
                </p>

                <p>
                    <strong>Precio:</strong> USD ${producto.precio}
                </p>

                <p>
                    <strong>Stock:</strong> ${producto.stock} unidades
                </p>
               
                <button
                    class="btn btn-primary"
                    id="agregarDetalle"
                    type="button"
                >
                    Agregar al carrito
                </button>

            </div>

        </div>
    `;
    const botonAgregar = document.querySelector("#agregarDetalle");

    botonAgregar.addEventListener("click", () => {

        agregarAlCarrito(producto.id);

    });
} else {

    contenedor.innerHTML = `
        <div class="text-center">
            <h1>Producto no encontrado</h1>
            <p class="text-secondary">
                El producto solicitado no existe.
            </p>
            <a href="catalogo.html" class="btn btn-primary">
                Volver al catálogo
            </a>
        </div>
    `;

}