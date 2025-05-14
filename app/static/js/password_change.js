document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("security-form");
    const stepUsername = document.getElementById("step-username");
    const stepSecurity = document.getElementById("step-security");
    const questionText = document.getElementById("security-question");

    const inputUsername = form.querySelector('[name="username"]');
    const inputAnswer = form.querySelector('[name="security_answer"]');
    const inputNewPassword = form.querySelector('[name="new_password"]');

    let currentUsername = "";

    // Utilidad para cambiar entre pasos
    function mostrarPaso2() {
        stepUsername.style.display = "none";
        stepSecurity.style.display = "block";

        inputUsername.required = false;
        inputAnswer.required = true;
        inputNewPassword.required = true;
    }

    function mostrarPaso1() {
        stepUsername.style.display = "block";
        stepSecurity.style.display = "none";

        inputUsername.required = true;
        inputAnswer.required = false;
        inputNewPassword.required = false;
    }

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        const formData = new FormData(form);

        if (stepUsername.style.display !== "none") {
            // Paso 1: Obtener pregunta
            fetch(djangoUrls.validateSecurityQuestion, {
                method: "POST",
                headers: { "X-CSRFToken": csrfToken },
                body: formData
            })
                .then(res => res.json())
                .then(data => {
                    if (data.status === "ok") {
                        questionText.innerText = data.question;
                        currentUsername = inputUsername.value;
                        mostrarPaso2();
                    } else {
                        Swal.fire({
                            icon: "error",
                            title: "Usuario no válido",
                            text: data.message || "El usuario ingresado no es válido.",
                            confirmButtonText: "Aceptar"
                        });
                    }
                });
        } else {
            // Paso 2: Validar respuesta y cambiar contraseña
            const payload = new URLSearchParams({
                username: currentUsername,
                security_answer: inputAnswer.value,
                new_password: inputNewPassword.value
            });

            fetch(djangoUrls.resetPassword, {
                method: "POST",
                headers: { "X-CSRFToken": csrfToken },
                body: payload
            })
                .then(res => res.json())
                .then(data => {
                    if (data.status === "ok") {
                        Swal.fire({
                            icon: "success",
                            title: "<strong>¡Contraseña cambiada exitosamente!</strong>",
                            html: "Tu contraseña ha sido actualizada correctamente.",
                            confirmButtonText: "Aceptar",
                            customClass: {
                                title: "swal-title",
                                htmlContainer: "swal-text",
                                confirmButton: "swal-button"
                            }
                        }).then(() => {
                            const modal = bootstrap.Modal.getInstance(document.getElementById('password-reset-modal'));
                            modal.hide();
                            form.reset();
                            mostrarPaso1();
                        });
                    } else {
                        Swal.fire({
                            icon: "error",
                            title: "<strong>Error</strong>",
                            html: data.message || "La respuesta ingresada no es correcta.",
                            confirmButtonText: "Aceptar",
                            customClass: {
                                title: "swal-title",
                                htmlContainer: "swal-text",
                                confirmButton: "swal-button"
                            }
                        });
                    }
                });
        }
    });

    // Resetear modal al cerrarlo
    const passwordResetModal = document.getElementById('password-reset-modal');
    if (passwordResetModal) {
        passwordResetModal.addEventListener('hidden.bs.modal', function () {
            form.reset();
            mostrarPaso1();
        });
    }

    // Inicializa visibilidad correctamente por si algo queda mal
    mostrarPaso1();
});

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("security-form");
    const inputNewPassword = form.querySelector('[name="new_password"]');

    // Función para validar la contraseña
    function validarContrasena(password) {
        const tieneLongitud = password.length >= 8;
        const tieneNumero = /\d/.test(password);
        const tieneEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        return tieneLongitud && tieneNumero && tieneEspecial;
    }

    form.addEventListener("submit", function (e) {
        const nuevaContrasena = inputNewPassword.value;

        // Validar la contraseña antes de enviar el formulario
        if (!validarContrasena(nuevaContrasena)) {
            e.preventDefault(); // Evita que el formulario se envíe
            // SweetAlert eliminado
        }
    });
});