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
        "auth/missing-password": "Ingresá una contraseña.",
        "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
        "auth/too-many-requests": "Se realizaron demasiados intentos. Probá nuevamente más tarde."
    };

    return mensajes[codigo] || "Ocurrió un error. Intentá nuevamente.";
}


function cambiarFormulario(mostrarFormularioRegistro) {
    seccionLogin?.classList.toggle("d-none", mostrarFormularioRegistro);
    seccionRegistro?.classList.toggle("d-none", !mostrarFormularioRegistro);
}


function mostrarNombrePerfil(nombre) {
    nombrePerfil.textContent = nombre;
    avatarPerfil.textContent = nombre.charAt(0).toUpperCase();
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
            mostrarMensaje("Ingresá tu nombre.");
            return;
        }

        if (password !== confirmacion) {
            mostrarMensaje("Las contraseñas no coinciden.");
            return;
        }

        try {
            const credencial = await createUserWithEmailAndPassword(auth, email, password);
            const usuario = credencial.user;

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
        } catch (error) {
            console.error(error);
            mostrarMensaje(mensajeError(error.code));
        }
    });
}


if (formLogin) {
    formLogin.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const email = document.querySelector("#emailLogin").value.trim();
        const password = document.querySelector("#passwordLogin").value;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            formLogin.reset();
            mostrarMensaje("Sesión iniciada correctamente.");
        } catch (error) {
            console.error(error);
            mostrarMensaje(mensajeError(error.code));
        }
    });
}


onAuthStateChanged(auth, async (usuario) => {
    if (btnSesion) {
        btnSesion.textContent = usuario ? "Cerrar sesión" : "Ingresar";
    }

    if (!accesoPerfil || !datosPerfil) {
        return;
    }

    accesoPerfil.classList.toggle("d-none", Boolean(usuario));
    datosPerfil.classList.toggle("d-none", !usuario);

    if (usuario) {
        emailPerfil.textContent = usuario.email;
        mostrarNombrePerfil(usuario.displayName || "Usuario de GamerLab");
        rolPerfil.textContent = "Cliente";
        fechaRegistroPerfil.textContent = "Cargando...";

        try {
            const referenciaUsuario = doc(db, "usuarios", usuario.uid);
            const documento = await getDoc(referenciaUsuario);

            if (documento.exists()) {
                const datosUsuario = documento.data();
                const datosFaltantes = {};

                mostrarNombrePerfil(datosUsuario.nombre || usuario.displayName || "Usuario de GamerLab");
                emailPerfil.textContent = datosUsuario.email || usuario.email;
                rolPerfil.textContent = datosUsuario.rol || "cliente";

                if (datosUsuario.fechaRegistro) {
                    fechaRegistroPerfil.textContent = datosUsuario.fechaRegistro
                        .toDate()
                        .toLocaleDateString("es-UY");
                } else {
                    datosFaltantes.fechaRegistro = serverTimestamp();
                    fechaRegistroPerfil.textContent = "Registrado recientemente";
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
                }
            } else {
                await setDoc(referenciaUsuario, {
                    nombre: usuario.displayName || "Usuario de GamerLab",
                    email: usuario.email,
                    fechaRegistro: serverTimestamp(),
                    rol: "cliente"
                });
                fechaRegistroPerfil.textContent = "Registrado recientemente";
            }
        } catch (error) {
            console.error(error);
            mostrarMensaje("No se pudieron cargar los datos guardados en Firestore.");
        }
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
