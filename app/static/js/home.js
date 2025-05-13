//Iluminar el modulo en la barra de navegación donde se encuentra el usuario
document.addEventListener('DOMContentLoaded', function () {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        if (link.id === 'collapse-menu-button') {
            return;
        }

        const linkPath = new URL(link.href).pathname;
        if (linkPath === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});

//Modo Oscuro
document.addEventListener("DOMContentLoaded", function () {
    const darkModeToggle = document.getElementById("dark-mode-toggle");
    const body = document.body;
    const html = document.documentElement;
    const dataTables = document.querySelectorAll(".dataTable"); // Selecciona todas las tablas con DataTables

    function applyDarkMode(enabled) {
        if (enabled) {
            body.classList.add("dark-mode");
            html.classList.add("dark");
            html.setAttribute("data-bs-theme", "dark");
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            dataTables.forEach(table => table.classList.add("table-dark")); // Aplica estilo oscuro a DataTables
            localStorage.setItem("dark-mode", "enabled");
        } else {
            body.classList.remove("dark-mode");
            html.classList.remove("dark");
            html.setAttribute("data-bs-theme", "light");
            darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            dataTables.forEach(table => table.classList.remove("table-dark")); // Quita el estilo oscuro de DataTables
            localStorage.setItem("dark-mode", "disabled");
        }
    }

    // Cargar modo guardado en localStorage
    const darkModeEnabled = localStorage.getItem("dark-mode") === "enabled";
    applyDarkMode(darkModeEnabled);

    // Evento de cambio de modo
    darkModeToggle.addEventListener("click", function () {
        applyDarkMode(!body.classList.contains("dark-mode"));
    });
});

//Redigir al login si la sesion ha terminado
document.addEventListener('DOMContentLoaded', function () {
    // Verificar si debemos forzar recarga
    if (new URLSearchParams(window.location.search).has('session_terminated')) {
        window.location.href = "{% url 'login' %}?session_terminated=1";
    }

    // Manejar respuestas AJAX
    $(document).ajaxComplete(function (event, xhr) {
        try {
            const response = JSON.parse(xhr.responseText);
            if (response.force_reload) {
                window.location.href = response.login_url;
            }
        } catch (e) { }
    });
});

window.onpageshow = function (event) {
    if (event.persisted) {
        window.location.reload();
    }
};

document.addEventListener('DOMContentLoaded', function () {
    const collapseButton = document.getElementById('collapse-menu-button');
    const brandLink = document.querySelector('.brand-link');
    const brandText = document.querySelector('.brand-text');
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    // Escuchar el evento de clic en el botón de colapso
    collapseButton.addEventListener('click', function () {
        const sidebar = document.querySelector('.main-sidebar');
        if (sidebar.classList.contains('sidebar-collapse')) {
            brandText.style.display = 'none'; // Ocultar la letra
            brandLink.classList.add('collapsed'); // Reducir el tamaño del contenedor
            darkModeToggle.style.display = 'none'; // Ocultar el botón de modo oscuro
        } else {
            brandText.style.display = 'inline'; // Mostrar la letra
            brandLink.classList.remove('collapsed'); // Restaurar el tamaño del contenedor
            darkModeToggle.style.display = 'inline-block'; // Mostrar el botón de modo oscuro
        }
    });

    // Configuración inicial al cargar la página
    const sidebar = document.querySelector('.main-sidebar');
    if (sidebar.classList.contains('sidebar-collapse')) {
        brandText.style.display = 'none';
        brandLink.classList.add('collapsed');
        darkModeToggle.style.display = 'none';
    } else {
        brandText.style.display = 'inline';
        brandLink.classList.remove('collapsed');
        darkModeToggle.style.display = 'inline-block';
    }
});