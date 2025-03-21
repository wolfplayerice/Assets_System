let dataTableCategory;
let dataTableIsInitializedCategory = false;

const initDataTableCategory = async () => {
    if (dataTableIsInitializedCategory) {
        dataTableCategory.destroy();
        dataTableCategory = null; // Liberar referencia para la recolección de basura
    }

    dataTableCategory = $("#datatable-cat").DataTable({
        serverSide: true,
        ajax: {
            url: "http://127.0.0.1:8000/category/list_category/",
            error: function (jqXHR, textStatus, errorThrown) {
                console.error("Error fetching data:", textStatus, errorThrown);
                alert("Error al cargar los datos. Por favor, inténtelo de nuevo.");
            },
        },
        columns: [
            {
                data: null,
                render: function (data, type, row, meta) {
                    return meta.row + meta.settings._iDisplayStart + 1;
                },
            },
            { data: "name" },
            {
                data: null,
                render: function (data, type, row) {
                    return `
                        <button class='btn btn-sm btn-primary edit-btn' data-id='${row.id}'>
                            <i class='fa-solid fa-pencil'></i>
                        </button>
                        <button class='btn btn-sm btn-danger delete-btn' data-id='${row.id}'>
                            <i class='fa-solid fa-trash-can'></i>
                        </button>`;
                },
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
                                    {
                                        image: logo,
                                        width: 100, // Ancho de la imagen
                                        alignment: 'center', // Alineación de la imagen
                                        margin: [0, 0, 0, 10] // Margen de la imagen
                                    },
                                    { text: 'Lista de Categorías', style: 'header', alignment: 'center', margin: [0, 10, 0, 20] },
                                    { table: { 
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

    dataTableIsInitializedCategory = true;
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
                headers: {
                    "X-CSRFToken": getCookie("csrftoken")
                },
                success: function (response) {
                    Swal.fire('Eliminado!', response.message, 'success');
                    dataTableCategory.ajax.reload(); // Recargar la tabla después de eliminar
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    Swal.fire('Error!', "Error al eliminar la categoría: " + (jqXHR.responseJSON?.error || "Error desconocido"), 'error');
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