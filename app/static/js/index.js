let dataTable;
let dataTableIsInitialized = false;

const dataTableOptions = {
    ajax: {
        url: "http://127.0.0.1:8000/inventory/list_assets/",
        dataSrc: 'Asset' // Asegúrate de que esta sea la ruta correcta en tu respuesta JSON
    },
    columnDefs: [
        { targets: [7], orderable: false },
        { targets: [7], searchable: false },
        { targets: [7], className: 'dt-center' }
    ],
    columns: [
        { data: null, render: (data, type, row, meta) => meta.row }, // Índice
        { data: 'fk_brand' },
        { data: 'model' },
        { data: 'fk_category' },
        { data: 'serial_number' },
        { data: 'state_asset' },
        { data: 'status' },
        {
            data: null,
            render: (data, type, row) => `
                <button class='btn btn-sm btn-primary btn-edit centered'><i class='fa-solid fa-pencil'></i></button>
                <button class='btn btn-sm btn-danger delete-btna centered' data-id="${row.id}"><i class='fa-solid fa-trash-can'></i></button>
            `
        }
    ]
};

const initDataTable = async () => {
    if (dataTableIsInitialized) {
        dataTable.destroy();
    }

    dataTable = $("#datatable-assets").DataTable(dataTableOptions);
    dataTableIsInitialized = true;
};

$(document).on('click', '.delete-btna', function () {
    var assetId = $(this).data('id');
    // Alerta personalizada con sweetalert
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
                    dataTable.ajax.reload(); // Recargar la tabla después de eliminar
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    Swal.fire(
                        'Error!',
                        "Error al eliminar la categoría: " + (jqXHR.responseJSON?.error || "Error desconocido"),
                        'error'
                    );
                }
            });
        }
    });
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