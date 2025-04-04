document.addEventListener('DOMContentLoaded', function () {
    // Delegación de eventos para manejar los botones de "mostrar contraseña"
    document.body.addEventListener('click', function (event) {
        // Verifica si el elemento clicado tiene la clase 'toggle-password'
        if (event.target.closest('.toggle-password')) {
            const toggleButton = event.target.closest('.toggle-password');
            const targetSelector = toggleButton.getAttribute('data-target');
            const passwordField = document.querySelector(targetSelector);

            if (passwordField) {
                // Alterna entre 'password' y 'text'
                const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordField.setAttribute('type', type);

                // Cambia el ícono del botón
                const icon = toggleButton.querySelector('i');
                if (icon) {
                    icon.classList.toggle('fa-eye');
                    icon.classList.toggle('fa-eye-slash');
                }
            }
        }
    });
});
