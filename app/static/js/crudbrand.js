let dataTableBrand;
let dataTableIsInitializedBrand = false;

const dataTableOptionsBrand = {
    ajax: {
        url: "http://127.0.0.1:8000/brand/list_brand/",
        dataSrc: 'Brand'
    },
    columnDefs: [
        { targets: [2], orderable: false, searchable: false, className: 'dt-center',targets: "_all" },
    ],
    columns: [
        { data: null, render: (data, type, row, meta) => meta.row + 1 },
        { data: 'name' },
        {
            data: null,
            render: (data, type, row) => `
                <button class='btn btn-sm btn-primary btn-edit centered'>
                    <i class='fa-solid fa-pencil'></i>
                </button>
                <button class='btn btn-sm btn-danger delete-btn-brand centered' data-id="${row.id}">
                    <i class='fa-solid fa-trash-can'></i>
                </button>
            `
        }
    ],
    responsive: true,
    dom: 'lBfrtip',
    buttons: [
        {
            extend: 'excelHtml5',
            text: '<i class="fas fa-file-excel"></i>',
            titleAttr: 'Exportar a Excel',
            className: 'btn btn-success',
            exportOptions: { columns: [0, 1] }
        },
        {
            extend: 'pdfHtml5',
            text: '<i class="fas fa-file-pdf"></i>',
            titleAttr: 'Exportar a PDF',
            className: 'btn btn-danger',
            exportOptions: { columns: [0, 1] }
        },
        {
            extend: 'print',
            text: '<i class="fa fa-print"></i>',
            titleAttr: 'Imprimir',
            className: 'btn btn-info',
            exportOptions: { columns: [0, 1] }
        }
    ]
};

const initDataTableBrand = async () => {
    try {
        if (dataTableIsInitializedBrand) {
            dataTableBrand.destroy();
            dataTableBrand = null; // Liberar referencia
        }

        dataTableBrand = $("#datatable-brand").DataTable(dataTableOptionsBrand);
        dataTableIsInitializedBrand = true;
    } catch (error) {
        console.error("Error initializing DataTable:", error);
        Swal.fire('Error!', 'Error al inicializar la tabla.', 'error');
    }
};

$(document).on('click', '.delete-btn-brand', function () {
    const brandId = $(this).data('id');

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
                headers: { "X-CSRFToken": getCookie("csrftoken") },
                success: (response) => {
                    Swal.fire('Eliminado!', response.message, 'success');
                    dataTableBrand.ajax.reload();
                },
                error: (jqXHR) => {
                    Swal.fire('Error!', "Error al eliminar la marca: " + (jqXHR.responseJSON?.error || "Error desconocido"), 'error');
                }
            });
        }
    });
});

function getCookie(name) {
    const cookieValue = document.cookie.split('; ').find(row => row.startsWith(name + '='));
    return cookieValue ? decodeURIComponent(cookieValue.split('=')[1]) : null;
}

window.addEventListener('load', initDataTableBrand);