window.addEventListener('load', function () {
    const successMessage = document.getElementById('success-message');
    const errorMessage = document.getElementById('error-message');

    if (successMessage) {
        Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: successMessage.textContent
        });
    }


    if (errorMessage) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMessage.textContent
        });
    }
});
document.getElementById('toggle-password').addEventListener('click', function () {
    var passwordField = document.getElementById('id_password');
    var passwordFieldType = passwordField.getAttribute('type');
    if (passwordFieldType === 'password') {
        passwordField.setAttribute('type', 'text');
        this.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        passwordField.setAttribute('type', 'password');
        this.innerHTML = '<i class="fas fa-eye"></i>';
    }
});



