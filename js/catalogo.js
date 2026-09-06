function mostrarProductos(productos) {

    const contenedor = document.querySelector("#catalogoProductos");

    contenedor.innerHTML = "";

    if (productos.length === 0) {

        contenedor.innerHTML = `
        <div class="col-12">
            <p class="text-center text-secondary">
                No se encontraron productos.
            </p>
        </div>
    `;

        return;
    }

    productos.forEach((producto) => {

        contenedor.innerHTML += `
            <div class="col-md-6 col-xl-4">
                <article class="placeholder-product h-100">

                    <img 
                        src="${producto.imagen}" 
                        alt="${producto.nombre}" 
                        class="product-image"
                    >

                    <div class="p-3">

                        <span class="eyebrow">${producto.categoria}</span>

                        <h2 class="h5 mt-2">${producto.nombre}</h2>

                        <p class="text-secondary small">
                            ${producto.descripcion}
                        </p>

                        <p class="mb-1">
                            <strong>Precio:</strong> USD ${producto.precio}
                        </p>

                        <p class="mb-3">
                            <strong>Stock:</strong> ${producto.stock} unidades
                        </p>

                        <a href="producto.html?id=${producto.id}"
                        class="btn btn-primary btn-sm"
                        >
                        Ver producto
                        </a>

                    </div>

                </article>
            </div>
        `;
    });
}

const buscador = document.querySelector("#buscarProducto");
const selectorCategoria = document.querySelector("#filtroCategoria");

function aplicarFiltros() {

    const textoBusqueda = buscador.value.toLowerCase();
    const categoriaSeleccionada = selectorCategoria.value;

    let productosFiltrados = productos.filter((producto) =>
        producto.nombre.toLowerCase().includes(textoBusqueda)
    );

    if (categoriaSeleccionada !== "Todas") {

        productosFiltrados = productosFiltrados.filter((producto) =>
            producto.categoria === categoriaSeleccionada
        );

    }

    mostrarProductos(productosFiltrados);
}

buscador.addEventListener("input", aplicarFiltros);
selectorCategoria.addEventListener("change", aplicarFiltros);

mostrarProductos(productos);
