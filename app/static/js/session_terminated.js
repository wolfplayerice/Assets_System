document.addEventListener('DOMContentLoaded', function () {
    Swal.fire({
        icon: 'warning',
        title: 'Sesión interrumpida',
        text: 'Tu sesión fue cerrada porque iniciaste sesión desde otro dispositivo.',
        confirmButtonText: 'Entendido'
    });
});
