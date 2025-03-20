let dataTableCategory;
let dataTableIsInitializedCategory = false;

const initDataTableCategory = async () => {
    try {
        if (dataTableIsInitializedCategory) {
            dataTableCategory.destroy();
            dataTableCategory = null; // Liberar referencia para la recolección de basura
        }

        dataTableCategory = $("#datatable-cat").DataTable({
            serverSide: true,
            ajax: {
                url: "http://127.0.0.1:8000/category/list_category/",
                error: (jqXHR, textStatus, errorThrown) => {
                    console.error("Error fetching data:", textStatus, errorThrown);
                    Swal.fire('Error!', 'Error al cargar los datos. Por favor, inténtelo de nuevo.', 'error');
                },
            },
            columns: [
                {
                    data: null,
                    render: (data, type, row, meta) => meta.row + meta.settings._iDisplayStart + 1,
                },
                { data: "name" },
                {
                    data: null,
                    render: (data, type, row) => `
                        <button class='btn btn-sm btn-primary edit-btn' data-id='${row.id}'>
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
                            url: 'http://127.0.0.1:8000/category/list_category/?all=true',
                            type: 'GET',
                            success: (response) => {
                                const data = response.Category.map(category => [category.id, category.name]);
                                const docDefinition = {
                                    content: [
                                        { text: 'Lista de Categorías', style: 'header', alignment: 'center', margin: [0, 10, 0, 20] },
                                        { table: { body: [['ID', 'Nombre'], ...data] } },
                                    ],
                                    styles: { header: { fontSize: 18, bold: true } },
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

        dataTableIsInitializedCategory = true;
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
                    Swal.fire('Error!', "Error al eliminar la categoría: " + (jqXHR.responseJSON?.error || "Error desconocido"), 'error');
                },
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
    await initDataTableCategory();
});