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
            columns: [
                {
                    data: null,
                    render: (data, type, row, meta) => meta.row + meta.settings._iDisplayStart + 1,
                },
                { data: "username" },
                { data: "name" },
                { data: "last_name" },
                { data: "email" },
                { data: "is_active" },
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
                        <button class='btn btn-sm btn-danger delete-btn' data-id='${row.id}'>
                            <i class='fa-solid fa-trash-can'></i>
                        </button>`,
                },
            ],
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
                                const data = response.Category.map(category => [category.id, category.name]);
                                const docDefinition = {
                                    content: [
                                        { text: 'Lista de Categorías', style: 'header', alignment: 'center', margin: [0, 10, 0, 20] },
                                        {
                                            table: {
                                                headerRows: 1,
                                                widths: ['*', '*'],
                                                body: [
                                                    [{ text: 'ID', style: 'tableHeader' }, { text: 'Nombre', style: 'tableHeader' }],
                                                    ...data
                                                ]
                                            },
                                            layout: 'lightHorizontalLines' // Estilo de la tabla
                                        }
                                    ],
                                    styles: {
                                        header: {
                                            fontSize: 18,
                                            bold: true,
                                            color: '#2c3e50' // Color del texto
                                        },
                                        tableHeader: {
                                            bold: true,
                                            fontSize: 13,
                                            color: '#34495e' // Color del texto del encabezado de la tabla
                                        }
                                    },
                                    defaultStyle: {
                                        fontSize: 12,
                                        color: '#2c3e50' // Color del texto por defecto
                                    }
                                };
                                pdfMake.createPdf(docDefinition).open();
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
                {
                    extend: "print",
                    text: '<i class="fa fa-print"></i> ',
                    titleAttr: "Imprimir",
                    className: "btn btn-info",
                    exportOptions: {
                        columns: [0, 1],
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

$(document).on('click', '.delete-btn', function () {
    const categoryId = $(this).data('id');
    Swal.fire({
        title: '¿Estás seguro de eliminar este registro?',
        text: "No podrás revertir esto.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar!'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `http://127.0.0.1:8000/category/delete_category/${categoryId}/`,
                type: 'DELETE',
                headers: { "X-CSRFToken": getCookie("csrftoken") },
                success: (response) => {
                    Swal.fire('Eliminado!', response.message, 'success');
                    dataTableCategory.ajax.reload();
                },
                error: (jqXHR, textStatus, errorThrown) => {
                    Swal.fire('Error!', "Error al eliminar e: " + (jqXHR.responseJSON?.error || "Error desconocido"), 'error');
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

    // Establecer la acción del formulario dinámicamente
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
