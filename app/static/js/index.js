let dataTable = {};
let dataTableIsInitialized = false;

function getDataTableConfig(includeActions = true) {
    const baseConfig = {
        ajax: {
            url: "http://127.0.0.1:8000/inventory/list_assets/",
            dataSrc: 'Asset'
        },
        columnDefs: [
            { targets: "_all", className: 'centered' }
        ],
        columns: [
            { data: null, render: (data, type, row, meta) => meta.row }, // Índice
            { data: 'fk_brand' },
            { data: 'model' },
            { data: 'fk_category' },
            { data: 'serial_number' },
            { data: 'state_asset' },
            { data: 'status' }
        ]
    };

    if (includeActions) {
        baseConfig.columns.push({
            data: null,
            render: (data, type, row) => {
                let buttons = '';
                if (row.status === 'Inoperativo') {
                    buttons += `<button class='btn btn-sm btn-warning btn-inoperativo centered' data-observation="${row.observation}"><i class='fa-solid fa-question'></i></button>`;
                }
                buttons += `
                    <button class='btn btn-sm btn-primary btn-edit centered' data-table-id="datatable-assets"><i class='fa-solid fa-pencil'></i></button>
                    <button class='btn btn-sm btn-danger delete-btna centered' data-id="${row.id}" data-table-id="datatable-assets"><i class='fa-solid fa-trash-can'></i></button>
                `;
                return buttons;
            }
        });

        baseConfig.columnDefs.push({
            targets: [7], 
            orderable: false,
            searchable: false
        });
    }

    return baseConfig;
}

// ...existing code...

const initDataTable = async (tableId, includeActions = true) => {
    if (dataTable[tableId]) {
        dataTable[tableId].destroy(); 
    }

    // Obtener la configuración base
    const dataTableOptions = getDataTableConfig(includeActions);

    // Inicializar DataTable en la tabla específica
    dataTable[tableId] = $(`#${tableId}`).DataTable(dataTableOptions);
};

$(document).on('click', '.delete-btna', function () {
    var assetId = $(this).data('id');
    var tableId = $(this).data('table-id'); // Obtener el ID de la tabla

    // Alerta personalizada con SweetAlert
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
                url: `http://127.0.0.1:8000/inventory/delete_asset/${assetId}/`,
                type: 'DELETE',
                headers: {
                    "X-CSRFToken": getCookie("csrftoken") // Asegúrate de que esta función esté definida
                },
                success: function (response) {
                    Swal.fire(
                        'Eliminado!',
                        response.message,
                        'success'
                    );
                    // Recargar la tabla correcta usando el ID de la tabla
                    if (dataTable[tableId]) {
                        dataTable[tableId].ajax.reload(null, false); // false para mantener la paginación actual
                    } else {
                        console.error("No se encontró la instancia de DataTables para la tabla:", tableId);
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    Swal.fire(
                        'Error!',
                        "Error al eliminar el activo: " + (jqXHR.responseJSON?.error || "Error desconocido"),
                        'error'
                    );
                }
            });
        }
    });
});

// Evento para mostrar el modal al hacer clic en el botón amarillo
$(document).on('click', '.btn-inoperativo', function () {
    const observation = $(this).data('observation');
    $('#inoperativoModal .modal-body p').text(observation);
    $('#inoperativoModal').modal('show');
});

// Función para obtener el valor de la cookie CSRF
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Verifica si el cookie comienza con el nombre que buscas
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

window.addEventListener('load', async () => {
    await initDataTable();
});