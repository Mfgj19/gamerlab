import { auth, db } from "./firebase/config.js";

import {
    addDoc,
    collection,
    getDocs,
    query,
    serverTimestamp,
    where
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


function iniciarDetalleProducto(evento) {
if (evento.detail.error) {
    mostrarMensaje(`${evento.detail.error} Se muestra el respaldo local.`);
}

const parametros = new URLSearchParams(window.location.search);

const id = parametros.get("id");

const producto = window.productos.find((producto) =>
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
                    ${!producto.disponible || producto.stock <= 0 ? "disabled" : ""}
                >
                    ${producto.disponible && producto.stock > 0 ? "Agregar al carrito" : "Producto sin stock"}
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
    const campoComentario = document.querySelector("#comentarioProducto");
    const botonComentario = document.querySelector("#publicarComentario");
    const listaComentarios = document.querySelector("#listaComentarios");
    let valorSeleccionado = 0;

    function escaparTexto(texto) {
        const elemento = document.createElement("div");
        elemento.textContent = texto;
        return elemento.innerHTML;
    }

    async function cargarOpiniones() {
        resumenValoraciones.textContent = "Cargando valoraciones...";
        listaComentarios.innerHTML = `<p class="text-secondary">Cargando comentarios...</p>`;

        try {
            const consulta = query(
                collection(db, "opiniones"),
                where("productoId", "==", producto.id)
            );
            const resultado = await getDocs(consulta);
            const opiniones = resultado.docs.map((documento) => documento.data());

            opiniones.sort((a, b) => {
                const fechaA = a.fecha?.toMillis() || 0;
                const fechaB = b.fecha?.toMillis() || 0;
                return fechaB - fechaA;
            });

            if (opiniones.length === 0) {
                resumenValoraciones.textContent = "Este producto todavía no tiene valoraciones.";
                listaComentarios.innerHTML = `
                    <p class="text-secondary">Este producto todavía no tiene comentarios.</p>
                `;
                return;
            }

            const promedio = opiniones.reduce(
                (total, opinion) => total + opinion.puntuacion,
                0
            ) / opiniones.length;

            resumenValoraciones.textContent =
                `Promedio: ${promedio.toFixed(1)} de 5 · ${opiniones.length} valoraciones`;

            listaComentarios.innerHTML = opiniones.map((opinion) => `
                <article class="border rounded p-3 mb-2">
                    <div class="d-flex justify-content-between gap-3 flex-wrap mb-2">
                        <strong>${escaparTexto(opinion.usuarioNombre)}</strong>
                        <span class="text-warning">${"★".repeat(opinion.puntuacion)}</span>
                    </div>
                    <p class="mb-0">${escaparTexto(opinion.comentario)}</p>
                </article>
            `).join("");
        } catch (error) {
            console.error(error);
            resumenValoraciones.textContent = "No se pudieron cargar las valoraciones.";
            listaComentarios.innerHTML = `
                <p class="text-danger">No se pudieron cargar los comentarios.</p>
            `;
        }
    }

    estrellas.forEach((estrella) => {
        estrella.addEventListener("click", () => {
            valorSeleccionado = Number(estrella.dataset.valor);

            estrellas.forEach((otraEstrella) => {
                const valorEstrella = Number(otraEstrella.dataset.valor);
                otraEstrella.classList.toggle("btn-warning", valorEstrella <= valorSeleccionado);
                otraEstrella.classList.toggle("btn-outline-warning", valorEstrella > valorSeleccionado);
            });
        });
    });

    botonComentario.addEventListener("click", async () => {
        const usuario = auth.currentUser;
        const textoComentario = campoComentario.value.trim();

        if (!usuario) {
            mostrarMensaje("Iniciá sesión para publicar una opinión.");
            return;
        }

        if (valorSeleccionado < 1 || valorSeleccionado > 5) {
            mostrarMensaje("Elegí una puntuación de 1 a 5 estrellas.");
            return;
        }

        if (textoComentario.length < 3 || textoComentario.length > 500) {
            mostrarMensaje("El comentario debe tener entre 3 y 500 caracteres.");
            return;
        }

        botonComentario.disabled = true;

        try {
            await addDoc(collection(db, "opiniones"), {
                productoId: producto.id,
                usuarioId: usuario.uid,
                usuarioNombre: usuario.displayName || usuario.email,
                puntuacion: valorSeleccionado,
                comentario: textoComentario,
                fecha: serverTimestamp()
            });

            campoComentario.value = "";
            valorSeleccionado = 0;
            estrellas.forEach((estrella) => {
                estrella.classList.remove("btn-warning");
                estrella.classList.add("btn-outline-warning");
            });
            mostrarMensaje("Opinión publicada correctamente.");
            await cargarOpiniones();
        } catch (error) {
            console.error(error);
            mostrarMensaje("No se pudo publicar la opinión.");
        } finally {
            botonComentario.disabled = false;
        }
    });

    cargarOpiniones();
    const relacionados = window.productos.filter((otroProducto) =>
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

    document.querySelector("#seccionValoraciones").style.display = "none";
    document.querySelector("#seccionRelacionados").style.display = "none";
    document.querySelector("#seccionComentarios").style.display = "none";

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

}


document.querySelector("#detalleProducto").innerHTML = `
    <p class="text-center text-secondary">Cargando producto...</p>
`;

window.addEventListener("productosCargados", iniciarDetalleProducto);

if (window.estadoProductos) {
    iniciarDetalleProducto({ detail: window.estadoProductos });
}
