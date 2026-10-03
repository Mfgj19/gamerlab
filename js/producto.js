const parametros = new URLSearchParams(window.location.search);

const id = parametros.get("id");

const producto = productos.find((producto) =>
    producto.id == id
);

const contenedor = document.querySelector("#detalleProducto");

if (producto) {

    contenedor.innerHTML = `
        <div class="row g-4 align-items-start">

            <div class="col-md-6">

    <div id="carouselProducto" class="carousel slide">

        <div class="carousel-inner">

            ${producto.imagenes.map((imagen, indice) => `
                <div class="carousel-item ${indice === 0 ? "active" : ""}">
                    <img
                        src="${imagen}"
                        class="d-block w-100"
                        alt="${producto.nombre} - imagen ${indice + 1}"
                    >
                </div>
            `).join("")}

        </div>

        <button
            class="carousel-control-prev"
            type="button"
            data-bs-target="#carouselProducto"
            data-bs-slide="prev"
        >
            <span class="carousel-control-prev-icon"></span>
            <span class="visually-hidden">Anterior</span>
        </button>

        <button
            class="carousel-control-next"
            type="button"
            data-bs-target="#carouselProducto"
            data-bs-slide="next"
        >
            <span class="carousel-control-next-icon"></span>
            <span class="visually-hidden">Siguiente</span>
        </button>

    </div>

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

                <div class="mt-4 mb-4">
                    <h2 class="h5">Características técnicas</h2>

                    <ul>
                        ${producto.caracteristicas.map((caracteristica) =>
        `<li>${caracteristica}</li>`
    ).join("")}
                    </ul>
                </div>

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

    const estrellas = document.querySelectorAll(".estrella");
    const resumenValoraciones = document.querySelector("#resumenValoraciones");

    function obtenerValoraciones() {

        return JSON.parse(
            localStorage.getItem("valoraciones")
        ) || {};

    }

    function guardarValoraciones(valoraciones) {

        localStorage.setItem(
            "valoraciones",
            JSON.stringify(valoraciones)
        );

    }

    function mostrarResumenValoraciones() {

        const valoraciones = obtenerValoraciones();

        const valoracionesProducto = valoraciones[producto.id] || [];

        if (valoracionesProducto.length === 0) {

            resumenValoraciones.textContent =
                "Este producto todavía no tiene valoraciones.";

            return;
        }

        const suma = valoracionesProducto.reduce(
            (total, valor) => total + valor,
            0
        );

        const promedio = suma / valoracionesProducto.length;

        resumenValoraciones.textContent =
            `Promedio: ${promedio.toFixed(1)} de 5 · ${valoracionesProducto.length} valoraciones`;
    }

    estrellas.forEach((estrella) => {

        estrella.addEventListener("click", () => {

            const valor = Number(estrella.dataset.valor);

            estrellas.forEach((otraEstrella) => {

                const valorEstrella = Number(otraEstrella.dataset.valor);

                if (valorEstrella <= valor) {
                    otraEstrella.classList.add("btn-warning");
                    otraEstrella.classList.remove("btn-outline-warning");
                } else {
                    otraEstrella.classList.remove("btn-warning");
                    otraEstrella.classList.add("btn-outline-warning");
                }

            });

            const valoraciones = obtenerValoraciones();

            if (!valoraciones[producto.id]) {
                valoraciones[producto.id] = [];
            }

            valoraciones[producto.id].push(valor);

            guardarValoraciones(valoraciones);

            mostrarResumenValoraciones();

        });


    });

    mostrarResumenValoraciones();
    const campoComentario = document.querySelector("#comentarioProducto");
const botonComentario = document.querySelector("#publicarComentario");
const listaComentarios = document.querySelector("#listaComentarios");

function obtenerComentarios() {

    return JSON.parse(
        localStorage.getItem("comentarios")
    ) || {};

}

function guardarComentarios(comentarios) {

    localStorage.setItem(
        "comentarios",
        JSON.stringify(comentarios)
    );

}

function mostrarComentarios() {

    const comentarios = obtenerComentarios();

    const comentariosProducto = comentarios[producto.id] || [];

    listaComentarios.innerHTML = "";

    if (comentariosProducto.length === 0) {

        listaComentarios.innerHTML = `
            <p class="text-secondary">
                Este producto todavía no tiene comentarios.
            </p>
        `;

        return;
    }

    comentariosProducto.forEach((comentario) => {

        listaComentarios.innerHTML += `
            <div class="border rounded p-3 mb-2">
                <p class="mb-0">${comentario}</p>
            </div>
        `;

    });

}

botonComentario.addEventListener("click", () => {

    const textoComentario = campoComentario.value.trim();

    if (textoComentario === "") {
        return;
    }

    const comentarios = obtenerComentarios();

    if (!comentarios[producto.id]) {
        comentarios[producto.id] = [];
    }

    comentarios[producto.id].push(textoComentario);

    guardarComentarios(comentarios);

    campoComentario.value = "";

    mostrarComentarios();

});

mostrarComentarios();
    const relacionados = productos.filter((otroProducto) =>
        otroProducto.categoria === producto.categoria &&
        otroProducto.id !== producto.id
    );

    const contenedorRelacionados = document.querySelector("#productosRelacionados");
    const seccionRelacionados = document.querySelector("#seccionRelacionados");

    if (relacionados.length > 0) {

        relacionados.forEach((relacionado) => {

            contenedorRelacionados.innerHTML += `
            <div class="col-md-6 col-xl-4">
                <article class="placeholder-product h-100">

                    <img
                        src="${relacionado.imagen}"
                        alt="${relacionado.nombre}"
                        class="product-image"
                    >

                    <div class="p-3">
                        <span class="eyebrow">${relacionado.categoria}</span>

                        <h3 class="h5 mt-2">${relacionado.nombre}</h3>

                        <p>
                            <strong>Precio:</strong> USD ${relacionado.precio}
                        </p>

                        <a
                            href="producto.html?id=${relacionado.id}"
                            class="btn btn-primary btn-sm"
                        >
                            Ver producto
                        </a>
                    </div>

                </article>
            </div>
        `;
        });

    } else {

        seccionRelacionados.style.display = "none";
    }
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