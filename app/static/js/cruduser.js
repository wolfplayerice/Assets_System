let dataTableuser;
let dataTableIsInitializeduser = false;

var listUsersUrl = document.getElementById('data-container').getAttribute('data-list-users-url');
const initDataTableuser = async () => {
    try {
        if (dataTableIsInitializeduser) {
            dataTableuser.destroy();
            dataTableuser = null; // Liberar referencia para la recolección de basura
        }

        dataTableuser = $("#datatable-users").DataTable({
            serverSide: true,
            processing: true,
            ajax: {
                url: listUsersUrl,
                error: (jqXHR, textStatus, errorThrown) => {
                    console.error("Error fetching data:", textStatus, errorThrown);
                    Swal.fire('Error!', 'Error al cargar los datos. Por favor, inténtelo de nuevo.', 'error');
                },
            },
            columnDefs: [
                {
                    targets: [6], orderable: false, searchable: false,
                },
                {
                    className: 'dt-center', targets: "_all"
                },
            ],
            "language": {
                "lengthMenu": "Mostrar _MENU_ registros",
                "zeroRecords": "No se encontraron resultados",
                "info": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
                "infoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
                "infoFiltered": "(filtrado de un total de _MAX_ registros)",
                "sSearch": "Buscar:",
                "sProcessing": "Procesando...",
                "emptyTable": "No hay datos disponibles en la tabla",
            },
            columns: [
                {
                    data: null,
                    render: (data, type, row, meta) => meta.row + meta.settings._iDisplayStart + 1,
                },
                { data: "username" },
                { data: "name" },
                { data: "last_name" },
                { data: "email" },
                {
                    data: "is_active",
                    render: function (data, type, row) {
                        return data ? '<span class="badge bg-success">Activo</span>' : '<span class="badge bg-danger">Inactivo</span>';
                    }
                },
                {
                    data: null,
                    render: (data, type, row) => `
                        <button class='btn btn-sm btn-primary edit-user-btn' 
                            data-id='${row.id}'
                            data-username='${row.username}'
                            data-name='${row.name}'
                            data-last_name='${row.last_name}'
                            data-email='${row.email}'
                            data-security-question='${row.security_question}'
                            >
                            <i class='fa-solid fa-pencil'></i>
                        </button>
                        ${!row.is_staff ? `
                            <button class='btn btn-sm ${row.is_active ? 'btn-secondary disable-user-btn' : 'btn-success enable-user-btn'}' 
                                data-id='${row.id}'>
                                <i class='fa-solid ${row.is_active ? 'fa-user-slash' : 'fa-user'}'></i>
                            </button>` : ''}
                    `,
                },
            ],
            responsive: true,
            dom: "lBfrtip",
            buttons: [],
        });

        dataTableIsInitializeduser = true;
    } catch (error) {
        console.error("Error initializing DataTable:", error);
        Swal.fire('Error!', 'Error al inicializar la tabla.', 'error');
    }
};

function generateUserPDF() {
    const pdfButton = $('#external-pdf-button');


    pdfButton.addClass('pdf-button-loading');
    pdfButton.prop('disabled', true);

    $.ajax({
        url: `${listUsersUrl}?all=true`,
        type: 'GET',
        success: (response) => {
            const data = response.users.map(user => [user.id, user.username, user.name, user.last_name,
            user.email, user.is_active ? 'Activo' : 'Inactivo'
            ]);

            const today = new Date();

            const formattedDateTime = today.toLocaleString();
            const docDefinition = {
                pageSize: 'LETTER',
                pageMargins: [40, 80, 40, 40],
                header: {
                    columns: [
                        { image: gobernacion, width: 60, alignment: 'left', margin: [20, 10, 0, 10] },
                        {
                            text: 'LISTA DE USUARIOS',
                            style: 'header',
                            alignment: 'center',
                            margin: [10, 20, 0, 20]
                        },
                        { image: logo, width: 60, alignment: 'right', margin: [10, 10, 10, 10] }
                    ],
                    columnGap: 10,
                },
                content: [
                    {
                        table: {
                            headerRows: 1,
                            widths: ['auto', 'auto', 'auto', 'auto', '*', 'auto'],
                            body: [
                                [{ text: 'ID', style: 'tableHeader', alignment: 'center' },
                                { text: 'Usuario', style: 'tableHeader', alignment: 'center' },
                                { text: 'Nombre', style: 'tableHeader', alignment: 'center' },
                                { text: 'Apellido', style: 'tableHeader', alignment: 'center' },
                                { text: 'Correo', style: 'tableHeader', alignment: 'center' },
                                { text: 'Estado', style: 'tableHeader', alignment: 'center' },
                                ],
                                ...data.map(row => row.map(cell => ({
                                    text: cell,
                                    alignment: 'center',
                                    noWrap: false,
                                })))
                            ],

                        },
                        layout: 'Borders'
                    }
                ],
                styles: {
                    header: { fontSize: 18, bold: true, color: '#2c3e50' },
                    tableHeader: { bold: true, fontSize: 13, color: '#34495e' },
                    footer: { fontSize: 10, alignment: 'center', color: '#666666' }

                },
                defaultStyle: {
                    fontSize: 12,
                    color: '#2c3e50'
                },
                footer: (currentPage, pageCount) => {
                    return {
                        text: `Página ${currentPage} de ${pageCount} | Fecha de impresión: ${formattedDateTime}`,
                        style: 'footer',
                        margin: [0, 10, 0, 0]
                    };
                }
            };

            const pdfDocGenerator = pdfMake.createPdf(docDefinition);
            pdfDocGenerator.getBlob((blob) => {
                pdfButton.removeClass('pdf-button-loading').addClass('pdf-button-success');
                setTimeout(() => {
                    pdfButton.removeClass('pdf-button-success');
                    pdfButton.prop('disabled', false);
                }, 2000);

                saveAs(blob, `Usuarios_${formattedDateTime}.pdf`);
            });
        },
        error: (jqXHR, textStatus, errorThrown) => {
            console.error('Error fetching all data:', textStatus, errorThrown);
            // Animación de error
            pdfButton.removeClass('pdf-button-loading').addClass('pdf-button-error');
            setTimeout(() => {
                pdfButton.removeClass('pdf-button-error');
                pdfButton.prop('disabled', false);
            }, 2000);

            Swal.fire('Error!', 'Error al generar el PDF.', 'error');
        },
    });
}

// Evento click para el botón externo de PDF
$(document).on('click', '#external-pdf-button', function () {
    generateUserPDF();
});

$(document).on('click', '.disable-user-btn', function () {
    const userId = $(this).data('id');
    Swal.fire({
        title: '¿Estás seguro de deshabilitar este usuario?',
        text: "El usuario no podrá iniciar sesión.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, deshabilitar!',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: disableUserUrl.replace('0', userId),
                type: 'POST',
                headers: { "X-CSRFToken": getCookie("csrftoken") },
                success: (response) => {
                    Swal.fire('Deshabilitado!', response.message, 'success');
                    dataTableuser.ajax.reload();
                },
                error: (jqXHR, textStatus, errorThrown) => {
                    Swal.fire('Error!', "Error al deshabilitar: " + (jqXHR.responseJSON?.error || "Error desconocido"), 'error');
                },
            });
        }
    });
});

$(document).on('click', '.enable-user-btn', function () {
    const userId = $(this).data('id');
    Swal.fire({
        title: '¿Estás seguro de habilitar este usuario?',
        text: "El usuario podrá iniciar sesión nuevamente.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, habilitar!',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: enableUserUrl.replace('0', userId),
                type: 'POST',
                headers: { "X-CSRFToken": getCookie("csrftoken") },
                success: (response) => {
                    Swal.fire('Habilitado!', response.message, 'success');
                    dataTableuser.ajax.reload();
                },
                error: (jqXHR, textStatus, errorThrown) => {
                    Swal.fire('Error!', "Error al habilitar: " + (jqXHR.responseJSON?.error || "Error desconocido"), 'error');
                },
            });
        }
    });
});

$(document).on('click', '.edit-user-btn', function () {
    const userId = $(this).data('id');
    const username = $(this).data('username');
    const name = $(this).data('name');
    const last_name = $(this).data('last_name');
    const email = $(this).data('email');
    const securityQuestion = $(this).data('security-question');

    $('#edit-user-id').val(userId);
    $('#edit-user-username').val(username);
    $('#edit-user-name').val(name);
    $('#edit-user-last_name').val(last_name);
    $('#edit-user-email').val(email);
    $('#security_question').val(securityQuestion).trigger('change');

    $('#edit-user-form').attr('action', editUserUrl.replace('0', userId));

    $('#editUserModal').modal('show');
});

$(document).on('click', '#save-changes', function () {
    $('#edit-user-form').submit();
});

$(document).on('submit', '#edit-user-form', function (e) {
    e.preventDefault(); // Detenemos el envío tradicional del formulario.

    const form = $(this);
    const url = form.attr('action');
    const formData = new FormData(form[0]);

    // Verificación de contraseñas
    const passwordField = $('#edit-user-password').val();
    const confirmPasswordField = $('#edit-user-password2').val();

    if (passwordField !== confirmPasswordField) {
        Swal.fire({
            icon: 'error',
            title: '¡Error!',
            text: 'Las contraseñas no coinciden. Por favor, verifica e inténtalo de nuevo.',
            confirmButtonText: 'Aceptar'
        });
        return; // Detenemos el flujo si las contraseñas no coinciden.
    }

    const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    if (passwordField && !passwordRegex.test(passwordField)) {
        Swal.fire({
            icon: 'error',
            title: '¡Error!',
            text: 'La contraseña debe tener al menos 8 caracteres y un carácter especial.',
            confirmButtonText: 'Aceptar'
        });
        return; // Detenemos el flujo si la contraseña no cumple con los requisitos.
    }

    const securityQuestionField = $('#security_question').val();
    const securityAnswerField = $('#security_answer').val();

    if (securityQuestionField && !securityAnswerField) {
        Swal.fire({
            icon: 'error',
            title: '¡Error!',
            text: 'Debes proporcionar una respuesta de seguridad si cambias la pregunta.',
            confirmButtonText: 'Aceptar'
        });
        return; // Detenemos el flujo si la respuesta de seguridad está vacía.
    }

    // Alerta de confirmación
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
            // Si el usuario confirma, enviamos el formulario con AJAX
            $.ajax({
                url: url,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                headers: { "X-CSRFToken": getCookie("csrftoken") },
                success: function (response) {
                    if (response.status === 'success') {
                        Swal.fire('¡Guardado!', response.message, 'success').then(() => {
                            location.reload(); // Recargar la página para reflejar los cambios.
                        });
                    } else {
                        Swal.fire('Error', response.message, 'error');
                    }
                },
                error: function () {
                    Swal.fire('Error', 'Ocurrió un error al procesar la solicitud.', 'error');
                }
            });
        }
    });
});


function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

window.addEventListener('load', async () => {
    await initDataTableuser();
});

// Script para la funcionalidad del ojo (mostrar/ocultar contraseñas)
document.addEventListener('DOMContentLoaded', function () {
    const togglePassword = document.querySelector('[data-target="#edit-user-password"]');
    const passwordField = document.getElementById('edit-user-password');

    togglePassword.addEventListener('click', function () {
        const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordField.setAttribute('type', type);
        this.querySelector('i').classList.toggle('fa-eye');
        this.querySelector('i').classList.toggle('fa-eye-slash');
    });

    const togglePassword2 = document.querySelector('[data-target="#edit-user-password2"]');
    const passwordField2 = document.getElementById('edit-user-password2');

    togglePassword2.addEventListener('click', function () {
        const type = passwordField2.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordField2.setAttribute('type', type);
        this.querySelector('i').classList.toggle('fa-eye');
        this.querySelector('i').classList.toggle('fa-eye-slash');
    });
});


$(document).on('submit', '#register-modal form', function (e) {
    e.preventDefault();
    const form = $(this);
    const url = form.attr('action');
    const data = form.serialize();

    $.post(url, data, function (response) {
        if (response.status === 'success') {
            Swal.fire('Éxito', response.message, 'success').then(() => {
                location.reload();
            });
        } else {
            Swal.fire('Error', response.message, 'error');
        }
    }).fail(function () {
        Swal.fire('Error', 'Ocurrió un error al procesar la solicitud.', 'error');
    });
});

window.addEventListener('load', initDataTableuser);


document.addEventListener('DOMContentLoaded', function () {
    const securityQuestionField = document.getElementById('security_question');
    const securityAnswerField = document.getElementById('security_answer');

    securityQuestionField.addEventListener('change', function () {
        if (this.value) {
            securityAnswerField.required = true; // Hacer obligatorio
        } else {
            securityAnswerField.required = false; // No obligatorio
        }
    });
});