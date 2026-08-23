function mostrarProductos(productos) {

    const contenedor = document.querySelector("#catalogoProductos");

    contenedor.innerHTML = "";

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

                        <button class="btn btn-primary btn-sm" type="button">
                            Ver producto
                        </button>

                    </div>

                </article>
            </div>
        `;
    });
}

mostrarProductos(productos);