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
            ajax: {
                url: listUsersUrl,
                error: (jqXHR, textStatus, errorThrown) => {
                    console.error("Error fetching data:", textStatus, errorThrown);
                    Swal.fire('Error!', 'Error al cargar los datos. Por favor, inténtelo de nuevo.', 'error');
                },
            },
            columnDefs: [
                {
                    targets: [2], orderable: false, searchable: false,
                    className: 'dt-center', targets: "_all"
                },
            ],
            "language": {
                "lengthMenu": "Mostrar _MENU_ registros",
                "zeroRecords": "No se encontraron resultados",
                "info": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
                "infoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
                "infoFiltered": "(filtrado de un total de MAX registros)",
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
            serverSide: true,
            responsive: true,
            dom: "lBfrtip",
            buttons: [
                {
                    extend: "excelHtml5",
                    text: '<i class="fas fa-file-excel"></i> ',
                    titleAttr: "Exportar a Excel",
                    className: "btn btn-success",
                    exportOptions: {
                        columns: [0, 1],
                    },
                },
                {
                    extend: 'pdfHtml5',
                    text: '<i class="fas fa-file-pdf"></i>',
                    titleAttr: 'Exportar a PDF',
                    className: 'btn btn-danger',
                    action: (e, dt, button, config) => {
                        $("#loading-indicator").show();
                        $.ajax({
                            url: 'http://127.0.0.1:8000/users/list_users/?all=true',
                            type: 'GET',
                            success: (response) => {
                                const data = response.users.map(user => [user.id, user.username, user.name,  user.last_name,
                                    user.email, user.is_active
                                ]);

                                const today = new Date();

                                const formattedDateTime = today.toLocaleString();
                                const docDefinition = {
                                    content: [
                                        {
                                            columns: [
                                                {
                                                    image: gobernacion, 
                                                    width: 80, 
                                                    alignment: 'left', 
                                                    margin: [0, 0, 0, 10] 
                                                },
                                                {
                                                    text: '', 
                                                    width: '*', 
                                                },
                                                {
                                                    image: logo, 
                                                    width: 80, 
                                                    alignment: 'right', 
                                                    margin: [0, 0, 0, 10] 
                                                }
                                            ],
                                            columnGap: 10 
                                        },
                                        {
                                            text: 'Lista de usuarios',
                                            style: 'header',
                                            alignment: 'center',
                                            margin: [0, 10, 0, 20]
                                        },
                                        {
                                            table: {
                                                headerRows: 1,
                                                widths: ['auto', 'auto', 'auto' , 'auto', '*', 'auto'],
                                                body: [
                                                    [{ text: 'ID', style: 'tableHeader', alignment: 'center' },
                                                    { text: 'Usuario', style: 'tableHeader', alignment: 'center' },
                                                    { text: 'Nombre', style: 'tableHeader', alignment: 'center'},
                                                    { text: 'Apellido', style: 'tableHeader', alignment: 'center'},
                                                    { text: 'Correo', style: 'tableHeader', alignment: 'center'},
                                                    { text: 'Estado', style: 'tableHeader', alignment: 'center'},
                                                    ],
                                                    ...data.map(row => row.map(cell => ({
                                                        text: cell,
                                                        alignment: 'center',
                                                        noWrap: false,
                                                    })))
                                                ],

                                            },
                                            layout: 'lightHorizontalLines'
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

                                pdfMake.createPdf(docDefinition).download(`Usuarios_${formattedDateTime}.pdf`);
                                $("#loading-indicator").hide();
                            },
                            error: (jqXHR, textStatus, errorThrown) => {
                                console.error('Error fetching all data:', textStatus, errorThrown);
                                Swal.fire('Error!', 'Error al generar el PDF.', 'error');
                                $("#loading-indicator").hide();
                            },
                        });
                    },
                },
            ],
        });

        dataTableIsInitializeduser = true;
    } catch (error) {
        console.error("Error initializing DataTable:", error);
        Swal.fire('Error!', 'Error al inicializar la tabla.', 'error');
    }
};

$(document).on('click', '.disable-user-btn', function () {
    const userId = $(this).data('id');
    Swal.fire({
        title: '¿Estás seguro de deshabilitar este usuario?',
        text: "El usuario no podrá iniciar sesión.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, deshabilitar!'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `/users/disable_user/${userId}/`,
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
        confirmButtonText: 'Sí, habilitar!'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `/users/enable_user/${userId}/`,
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

    $('#edit-user-id').val(userId);
    $('#edit-user-username').val(username);
    $('#edit-user-name').val(name);
    $('#edit-user-last_name').val(last_name);
    $('#edit-user-email').val(email);

    $('#edit-user-form').attr('action', `/users/user_edit/${userId}/`);

    $('#editUserModal').modal('show');
});

$(document).on('click', '#save-changes', function () {
    $('#edit-user-form').submit();
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
