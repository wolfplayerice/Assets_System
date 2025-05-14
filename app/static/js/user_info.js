document.addEventListener('DOMContentLoaded', function () {
    const userId = userId2; // Obtén el ID del usuario autenticado desde el contexto de Django

    // Cambia dinámicamente el atributo 'action' del formulario
    document.getElementById('edit-form').setAttribute('action', editUserUrl.replace('0', userId));
});

document.addEventListener('DOMContentLoaded', function () {
    const togglePassword = document.getElementById('toggle-password');
    const passwordField = document.getElementById('edit_password');
    const passwordIcon = document.getElementById('password-icon');

    togglePassword.addEventListener('click', function () {
        const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordField.setAttribute('type', type);
        passwordIcon.classList.toggle('fa-eye');
        passwordIcon.classList.toggle('fa-eye-slash');
    });

    const togglePassword2 = document.getElementById('toggle-password2');
    const passwordField2 = document.getElementById('edit_password2');
    const passwordIcon2 = document.getElementById('password-icon2');

    togglePassword2.addEventListener('click', function () {
        const type = passwordField2.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordField2.setAttribute('type', type);
        passwordIcon2.classList.toggle('fa-eye');
        passwordIcon2.classList.toggle('fa-eye-slash');
    });
});

$(document).on('submit', '#edit-form', function (e) {
    e.preventDefault(); // Evita el envío inmediato del formulario

    const form = $(this);
    const url = form.attr('action');
    const data = form.serialize();

    // Obtén los campos del formulario
    const usernameField = $('#edit_username');
    const firstNameField = $('#edit_first_name');
    const lastNameField = $('#edit_last_name');
    const passwordField = $('#edit_password');
    const confirmPasswordField = $('#edit_password2');
    const securityQuestionField = $('#security_question'); // Campo de pregunta de seguridad
    const securityAnswerField = $('#security_answer'); // Campo de respuesta de seguridad

    const username = usernameField.val().trim();
    const firstName = firstNameField.val().trim();
    const lastName = lastNameField.val().trim();
    const password = passwordField.val().trim();
    const confirmPassword = confirmPasswordField.val().trim();
    const securityQuestion = securityQuestionField.val().trim();
    const securityAnswer = securityAnswerField.val().trim();

    // Valores iniciales (puedes obtenerlos desde el servidor o almacenarlos al cargar la página)
    const initialValues = {
        username: usernameField.data('initial-value'),
        firstName: firstNameField.data('initial-value'),
        lastName: lastNameField.data('initial-value'),
        securityQuestion: securityQuestionField.data('initial-value'),
        securityAnswer: securityAnswerField.data('initial-value')
    };

    // Verifica si no hay cambios en los campos
    if (
        username === initialValues.username &&
        firstName === initialValues.firstName &&
        lastName === initialValues.lastName &&
        password === '' &&
        confirmPassword === '' &&
        securityQuestion === initialValues.securityQuestion &&
        securityAnswer === initialValues.securityAnswer
    ) {
        Swal.fire({
            icon: 'info',
            title: 'Sin cambios',
            text: 'No se detectaron cambios en los campos.',
            confirmButtonText: 'Aceptar'
        });
        return; // Detiene el proceso de envío
    }

    // Validación: Verifica si las contraseñas coinciden
    if (password !== confirmPassword) {
        Swal.fire({
            icon: 'error',
            title: '¡Error!',
            text: 'Las contraseñas no coinciden. Por favor, verifica e inténtalo de nuevo.',
            confirmButtonText: 'Aceptar'
        });
        return; // Detiene el proceso de envío
    }

    // Validación: Verifica si la contraseña cumple con los requisitos
    const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    if (password !== '' && !passwordRegex.test(password)) {
        Swal.fire({
            icon: 'error',
            title: '¡Error!',
            text: 'La contraseña debe tener al menos 8 caracteres y un carácter especial.',
            confirmButtonText: 'Aceptar'
        });
        return; // Detiene el proceso de envío
    }

    // Si las validaciones pasan, muestra la alerta de confirmación
    Swal.fire({
        title: '¿Estás seguro?',
        text: "¿Deseas guardar los cambios realizados?",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Envía el formulario al servidor
            $.post(url, data, function (response) {
                if (response.status === 'success') {
                    Swal.fire('Éxito', response.message, 'success').then(() => {
                        location.reload();
                        clearEditForm();
                    });
                } else {
                    Swal.fire('Error', response.message, 'error');
                }
            }).fail(function () {
                Swal.fire('Error', 'Ocurrió un error al procesar la solicitud.', 'error');
            });
        }
    });
});

// Almacena los valores iniciales al cargar la página
$(document).ready(function () {
    $('#edit_username').data('initial-value', $('#edit_username').val().trim());
    $('#edit_first_name').data('initial-value', $('#edit_first_name').val().trim());
    $('#edit_last_name').data('initial-value', $('#edit_last_name').val().trim());
    $('#security_question').data('initial-value', $('#security_question').val().trim());
    $('#security_answer').data('initial-value', $('#security_answer').val().trim());
});

document.addEventListener('DOMContentLoaded', function () {
    const toggleSecurityAnswer = document.getElementById('toggle-security-answer');
    const securityAnswerField = document.getElementById('security_answer');
    const securityAnswerIcon = document.getElementById('security-answer-icon');

    toggleSecurityAnswer.addEventListener('click', function () {
        const type = securityAnswerField.getAttribute('type') === 'password' ? 'text' : 'password';
        securityAnswerField.setAttribute('type', type);
        securityAnswerIcon.classList.toggle('fa-eye');
        securityAnswerIcon.classList.toggle('fa-eye-slash');
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const securityQuestionField = document.getElementById('security_question');
    const securityAnswerField = document.getElementById('security_answer');
    const form = document.getElementById('edit-form');

    // Almacena el valor inicial del select y otros campos
    const initialValues = {
        securityQuestion: securityQuestionField.value,
        securityAnswer: securityAnswerField.value.trim(),
        username: document.getElementById('edit_username').value.trim(),
        firstName: document.getElementById('edit_first_name').value.trim(),
        lastName: document.getElementById('edit_last_name').value.trim(),
    };

    // Escucha cambios en el select de pregunta de seguridad
    securityQuestionField.addEventListener('change', function () {
        if (securityQuestionField.value !== initialValues.securityQuestion) {
            // Si el select cambia, activa el atributo required en el input de respuesta de seguridad
            securityAnswerField.setAttribute('required', 'required');
        } else {
            // Si el select vuelve a su valor inicial, elimina el atributo required
            securityAnswerField.removeAttribute('required');
        }
    });

    // Validación al enviar el formulario
    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Evita el envío inmediato del formulario

        const currentValues = {
            securityQuestion: securityQuestionField.value,
            securityAnswer: securityAnswerField.value.trim(),
            username: document.getElementById('edit_username').value.trim(),
            firstName: document.getElementById('edit_first_name').value.trim(),
            lastName: document.getElementById('edit_last_name').value.trim(),
        };

        // Verifica si no hay cambios en ningún campo
        if (
            currentValues.securityQuestion === initialValues.securityQuestion &&
            currentValues.securityAnswer === initialValues.securityAnswer &&
            currentValues.username === initialValues.username &&
            currentValues.firstName === initialValues.firstName &&
            currentValues.lastName === initialValues.lastName
        ) {
            Swal.fire({
                icon: 'info',
                title: 'Sin cambios',
                text: 'No se detectaron cambios en los campos.',
                confirmButtonText: 'Aceptar'
            });
            return;
        }

        // Verifica si el select cambió pero el input de respuesta de seguridad está vacío
        if (
            currentValues.securityQuestion !== initialValues.securityQuestion &&
            !currentValues.securityAnswer
        ) {
            Swal.fire({
                icon: 'error',
                title: '¡Error!',
                text: 'Debes proporcionar una respuesta de seguridad si cambias la pregunta de seguridad.',
                confirmButtonText: 'Aceptar'
            });
            return;
        }

        // Si todo está correcto, muestra la confirmación
        Swal.fire({
            title: '¿Estás seguro?',
            text: "¿Deseas guardar los cambios realizados?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, guardar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                form.submit(); // Envía el formulario
            }
        });
    });
});