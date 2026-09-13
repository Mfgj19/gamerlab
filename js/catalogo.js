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
                        <button
                            class="btn btn-outline-primary btn-sm agregar-carrito"
                            data-id="${producto.id}"
                            type="button"
                        >
                            Agregar al carrito
                        </button>
                    </div>

                </article>
            </div>
        `;
    });

    document.querySelectorAll(".agregar-carrito").forEach((boton) => {

        boton.addEventListener("click", () => {

            agregarAlCarrito(boton.dataset.id);
        });
    });
}

const buscador = document.querySelector("#buscarProducto");
const selectorCategoria = document.querySelector("#filtroCategoria");
const selectorOrden = document.querySelector("#ordenProductos");
const cantidadResultados = document.querySelector("#cantidadResultados");

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
    const ordenSeleccionado = selectorOrden.value;

    if (ordenSeleccionado === "Precio menor") {

        productosFiltrados.sort((a, b) =>
            a.precio - b.precio
        );

    } else if (ordenSeleccionado === "Precio mayor") {

        productosFiltrados.sort((a, b) =>
            b.precio - a.precio
        );

    } else if (ordenSeleccionado === "Nombre AZ") {

        productosFiltrados.sort((a, b) =>
            a.nombre.localeCompare(b.nombre)
        );

    } else if (ordenSeleccionado === "Nombre ZA") {

        productosFiltrados.sort((a, b) =>
            b.nombre.localeCompare(a.nombre)
        );

    }
    cantidadResultados.textContent =
    `${productosFiltrados.length} productos encontrados`;
    mostrarProductos(productosFiltrados);
}

buscador.addEventListener("input", aplicarFiltros);
selectorCategoria.addEventListener("change", aplicarFiltros);
selectorOrden.addEventListener("change", aplicarFiltros);

cantidadResultados.textContent =
    `${productos.length} productos encontrados`;
mostrarProductos(productos);
