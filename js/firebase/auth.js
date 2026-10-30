import { sesionCarritoLista, incorporarCarritoVisitante, esperarCarritoDe } from "../carrito.js";
import { auth, db } from "./config.js";

import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    doc,
    getDoc,
    serverTimestamp,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


let registroEnCurso = false;
let usuarioRegistro = null;
let revisionSesion = 0;

async function continuarCompra() {
    let continuar = false;
    try { continuar = sessionStorage.getItem("gamerlab:continuar-compra") === "si"; } catch {}
    if (!continuar) return false;
    await sesionCarritoLista;
    await esperarCarritoDe(auth.currentUser?.uid);
    incorporarCarritoVisitante();
    try { sessionStorage.removeItem("gamerlab:continuar-compra"); } catch {}
    window.location.href = "carrito.html";
    return true;
}

const formRegistro = document.querySelector("#formRegistro");
const formLogin = document.querySelector("#formLogin");
const accesoPerfil = document.querySelector("#accesoPerfil");
const datosPerfil = document.querySelector("#datosPerfil");
const nombrePerfil = document.querySelector("#nombrePerfil");
const emailPerfil = document.querySelector("#emailPerfil");
const fechaRegistroPerfil = document.querySelector("#fechaRegistroPerfil");
const rolPerfil = document.querySelector("#rolPerfil");
const avatarPerfil = document.querySelector("#avatarPerfil");
const btnSesion = document.querySelector("#btnLoginPlaceholder");
const seccionLogin = document.querySelector("#seccionLogin");
const seccionRegistro = document.querySelector("#seccionRegistro");
const mostrarRegistro = document.querySelector("#mostrarRegistro");
const mostrarLogin = document.querySelector("#mostrarLogin");
const enlacesAdmin = document.querySelectorAll("[data-admin-link]");
const contenidoAdmin = document.querySelector("#contenidoAdmin");
const estadoAdmin = document.querySelector("#estadoAdmin");


function mostrarMensaje(mensaje) {
    const toast = document.querySelector("#appToast");
    const texto = document.querySelector("#toastMessage");

    if (toast && texto) {
        texto.textContent = mensaje;
        bootstrap.Toast.getOrCreateInstance(toast).show();
    } else {
        alert(mensaje);
    }
}


function mensajeError(codigo) {
    const mensajes = {
        "auth/email-already-in-use": "El correo ya está registrado.",
        "auth/invalid-email": "El correo electrónico no es válido.",
        "auth/invalid-credential": "El correo o la contraseña no son correctos.",
        "auth/missing-password": "Ingresa una contraseña.",
        "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
        "auth/too-many-requests": "Se realizaron demasiados intentos. Prueba nuevamente más tarde."
    };

    return mensajes[codigo] || "Ocurrió un error. Intenta nuevamente.";
}


function cambiarFormulario(mostrarFormularioRegistro) {
    seccionLogin?.classList.toggle("d-none", mostrarFormularioRegistro);
    seccionRegistro?.classList.toggle("d-none", !mostrarFormularioRegistro);
}


function mostrarNombrePerfil(nombre) {
    nombrePerfil.textContent = nombre;
    avatarPerfil.textContent = nombre.charAt(0).toUpperCase();
}


function actualizarEnlacesAdmin(esAdministrador) {
    enlacesAdmin.forEach((enlace) => {
        enlace.classList.toggle("d-none", !esAdministrador);
    });
}


function redirigirSinPermisos(mensaje) {
    sessionStorage.setItem("mensajeAcceso", mensaje);
    window.location.replace("perfil.html");
}


const mensajeAcceso = sessionStorage.getItem("mensajeAcceso");

if (mensajeAcceso) {
    sessionStorage.removeItem("mensajeAcceso");
    mostrarMensaje(mensajeAcceso);
}


mostrarRegistro?.addEventListener("click", () => cambiarFormulario(true));
mostrarLogin?.addEventListener("click", () => cambiarFormulario(false));


if (formRegistro) {
    formRegistro.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const nombre = document.querySelector("#nombreRegistro").value.trim();
        const email = document.querySelector("#emailRegistro").value.trim();
        const password = document.querySelector("#passwordRegistro").value;
        const confirmacion = document.querySelector("#passwordConfirmacion").value;

        if (!nombre) {
            mostrarMensaje("Ingresa tu nombre.");
            return;
        }

        if (password !== confirmacion) {
            mostrarMensaje("Las contraseñas no coinciden.");
            return;
        }

        registroEnCurso = true;
        const boton = formRegistro.querySelector('[type="submit"]');
        boton.disabled = true;
        try {
            if (!usuarioRegistro) {
                const credencial = await createUserWithEmailAndPassword(auth, email, password);
                usuarioRegistro = credencial.user;
                ["emailRegistro", "passwordRegistro", "passwordConfirmacion"].forEach(id => document.getElementById(id).readOnly = true);
            }
            const usuario = usuarioRegistro;
            if (auth.currentUser?.uid !== usuario.uid) throw new Error("La sesión cambió. Inicia sesión para recuperar tu cuenta.");

            await updateProfile(usuario, {
                displayName: nombre
            });

            await setDoc(doc(db, "usuarios", usuario.uid), {
                nombre: nombre,
                email: usuario.email,
                fechaRegistro: serverTimestamp(),
                rol: "cliente"
            });

            formRegistro.reset();
            mostrarMensaje("Cuenta creada correctamente.");
            if (!(await continuarCompra())) window.location.href = "perfil.html";
        } catch (error) {
            console.error(error);
            mostrarMensaje(usuarioRegistro ? "La cuenta fue creada, pero no se pudo completar el perfil. Revisa la conexión y selecciona Reintentar guardar perfil." : mensajeError(error.code));
        } finally { registroEnCurso = false; boton.disabled = false; if (usuarioRegistro) boton.textContent = "Reintentar guardar perfil"; }
    });
}


if (formLogin) {
    formLogin.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const email = document.querySelector("#emailLogin").value.trim();
        const password = document.querySelector("#passwordLogin").value;

        const boton = formLogin.querySelector('[type="submit"]');
        boton.disabled = true;
        try {
            await signInWithEmailAndPassword(auth, email, password);
            formLogin.reset();
            mostrarMensaje("Sesión iniciada correctamente.");
            await continuarCompra();
        } catch (error) {
            console.error(error);
            mostrarMensaje(mensajeError(error.code));
        } finally { boton.disabled = false; }
    });
}


document.querySelector('#cerrarSesionMenu')?.addEventListener('click', () => btnSesion?.click());
function actualizarCuentaBarra(usuario, nombre) {
    document.querySelector('#menuCuentaGamer')?.classList.toggle('d-none', !usuario);
    btnSesion?.classList.toggle('d-none', Boolean(usuario));
    const etiqueta = document.querySelector('#nombreCuentaBarra');
    if (etiqueta) etiqueta.textContent = nombre || usuario?.displayName || 'Mi cuenta';
}
onAuthStateChanged(auth, async (usuario) => {
    actualizarCuentaBarra(usuario);
    const revision = ++revisionSesion;
    actualizarEnlacesAdmin(false);
    contenidoAdmin?.classList.add("d-none");
    if (registroEnCurso && usuario) return;
    if (btnSesion) {
        btnSesion.textContent = usuario ? "Cerrar sesión" : "Ingresar";
    }

    accesoPerfil?.classList.toggle("d-none", Boolean(usuario));
    datosPerfil?.classList.toggle("d-none", !usuario);

    if (!usuario) {
        actualizarEnlacesAdmin(false);

        if (document.body.dataset.page === "admin") {
            redirigirSinPermisos("Debes iniciar sesión para acceder al panel administrativo.");
        }

        return;
    }

    if (emailPerfil && rolPerfil && fechaRegistroPerfil) {
        emailPerfil.textContent = usuario.email;
        mostrarNombrePerfil(usuario.displayName || "Usuario de GamerLab");
        rolPerfil.textContent = "Cliente";
        fechaRegistroPerfil.textContent = "Cargando...";
    }

    try {
        const referenciaUsuario = doc(db, "usuarios", usuario.uid);
        const documento = await getDoc(referenciaUsuario);
        if (revision !== revisionSesion || auth.currentUser?.uid !== usuario.uid) return;
        let datosUsuario;

        if (documento.exists()) {
            datosUsuario = documento.data();
            const datosFaltantes = {};

            if (!datosUsuario.fechaRegistro) {
                datosFaltantes.fechaRegistro = serverTimestamp();
            }

            if (!datosUsuario.nombre) {
                datosFaltantes.nombre = usuario.displayName || "Usuario de GamerLab";
            }

            if (!datosUsuario.email) {
                datosFaltantes.email = usuario.email;
            }

            if (!datosUsuario.rol) {
                datosFaltantes.rol = "cliente";
            }

            if (Object.keys(datosFaltantes).length > 0) {
                await setDoc(referenciaUsuario, datosFaltantes, { merge: true });
                datosUsuario = { ...datosUsuario, ...datosFaltantes, rol: datosUsuario.rol || "cliente" };
            }
        } else {
            datosUsuario = {
                nombre: usuario.displayName || "Usuario de GamerLab",
                email: usuario.email,
                fechaRegistro: serverTimestamp(),
                rol: "cliente"
            };
            await setDoc(referenciaUsuario, datosUsuario);
        }

        if (revision !== revisionSesion || auth.currentUser?.uid !== usuario.uid) return;
        if (datosUsuario.activo === false) {
            await signOut(auth);
            actualizarEnlacesAdmin(false);
            mostrarMensaje("Esta cuenta fue desactivada por administración.");
            if (document.body.dataset.page === "admin") {
                redirigirSinPermisos("La cuenta está desactivada.");
            }
            return;
        }

        actualizarCuentaBarra(usuario, datosUsuario.nombre);
        const rol = String(datosUsuario.rol || "cliente");
        const esAdministrador = rol === "administrador";
        actualizarEnlacesAdmin(esAdministrador);

        if (nombrePerfil && emailPerfil && rolPerfil && fechaRegistroPerfil) {
            mostrarNombrePerfil(datosUsuario.nombre || usuario.displayName || "Usuario de GamerLab");
            emailPerfil.textContent = datosUsuario.email || usuario.email;
            rolPerfil.textContent = rol;

            if (datosUsuario.fechaRegistro?.toDate) {
                fechaRegistroPerfil.textContent = datosUsuario.fechaRegistro
                    .toDate()
                    .toLocaleDateString("es-UY");
            } else {
                fechaRegistroPerfil.textContent = "Registrado recientemente";
            }
        }

        if (document.body.dataset.page === "admin") {
            if (!esAdministrador) {
                redirigirSinPermisos("No tienes permisos para acceder al panel administrativo.");
                return;
            }

            estadoAdmin?.classList.add("d-none");
            contenidoAdmin?.classList.remove("d-none");
        }
    } catch (error) {
        console.error(error);
        actualizarEnlacesAdmin(false);

        if (document.body.dataset.page === "admin") {
            redirigirSinPermisos("No fue posible verificar tus permisos. Intenta nuevamente.");
            return;
        }

        mostrarMensaje("No se pudieron cargar los datos guardados en Firestore.");
    }
});


if (btnSesion) {
    btnSesion.addEventListener("click", async () => {
        if (!auth.currentUser) {
            window.location.href = "perfil.html";
            return;
        }

        try {
            await signOut(auth);
            mostrarMensaje("Sesión cerrada correctamente.");
        } catch (error) {
            console.error(error);
            mostrarMensaje("No se pudo cerrar la sesión.");
        }
    });
}
