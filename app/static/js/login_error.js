document.addEventListener('DOMContentLoaded', function () {
    if (typeof errorDisabled !== 'undefined' && errorDisabled) {
        Swal.fire({
            icon: 'error',
            title: 'Usuario deshabilitado',
            text: errorDisabled,
            confirmButtonText: 'Aceptar'
        });
    }

    if (typeof errorInvalid !== 'undefined' && errorInvalid) {
        Swal.fire({
            icon: 'error',
            title: 'Datos incorrectos',
            text: errorInvalid,
            confirmButtonText: 'Aceptar'
        });
    }
    if (typeof sessionTerminated !== 'undefined' && sessionTerminated) {
        Swal.fire({
            icon: 'warning',
            title: 'Sesión interrumpida',
            text: 'Tu sesión fue cerrada porque iniciaste sesión desde otro dispositivo.',
            confirmButtonText: 'Entendido'
        });
    }
});