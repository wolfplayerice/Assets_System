let dataTablebrand;
let dataTableIsInitializedbrand = false;

const dataTableOptionsbrand = {
    ajax: {
        url: "http://127.0.0.1:8000/brand/list_brand/",
        dataSrc: 'Brand' // Asegúrate de que esta sea la ruta correcta en tu respuesta JSON
    },
    columnDefs: [
        { targets: [2], orderable: false },
        { targets: [2], searchable: false },
        { targets: [2], className: 'dt-center' }
    ],
    columns: [
        { data: null, render: (data, type, row, meta) => meta.row }, // Índice
        { data: 'name' },
        {
            data: null,
            render: (data, type, row) => `
                <button class='btn btn-sm btn-primary btn-edit centered'><i class='fa-solid fa-pencil'></i></button>
                <button class='btn btn-sm btn-danger delete-btnbrand centered' data-id="${row.id}"><i class='fa-solid fa-trash-can'></i></button>
            `
        }
    ]
};

const initDataTablebrand = async () => {
    if (dataTableIsInitializedbrand) {
        dataTablebrand.destroy();
    }

    dataTablebrand = $("#datatable-brand").DataTable(dataTableOptionsbrand);
    dataTableIsInitializedbrand = true;
};

$(document).on('click', '.delete-btnbrand', function () {
    var brandId = $(this).data('id');
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
                url: `http://127.0.0.1:8000/brand/delete_brand/${brandId}/`,
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
                    dataTablebrand.ajax.reload(); // Recargar la tabla después de eliminar
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
    await initDataTablebrand();
});