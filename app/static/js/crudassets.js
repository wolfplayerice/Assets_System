let dataTable = {}; // Inicializamos dataTable como un objeto

var listAssetsUrl = document.getElementById('data-container').getAttribute('data-list-assets-url');

function getDataTableConfig(includeActions = true, tableId = "datatable-assets") {
    const baseConfig = {
        ajax: {
            url: listAssetsUrl,
            dataSrc: 'data'
        },
        serverSide: true,
        columnDefs: [
            { targets: "_all", className: 'centered' }
        ],
        /*         scrollCollapse: true,
                scroller: true,
                scrollY: 200, */
        columns: [
            {
                data: null,
                render: (data, type, row, meta) => meta.row + 1 // Índice comienza desde 1
            },
            { data: 'fk_brand' },
            { data: 'model' },
            { data: 'fk_category' },
            { data: 'serial_number' },
            { data: 'state_asset' },
            {
                data: 'status',
                render: (data, type, row) => {
                    if (data === 'Inoperativo' && tableId === "datatable-assets-dash") {
                        return `${data} <button class='btn btn-circle btn-warning btn-inoperativo' data-observation="${row.observation}"><i class='fa fa-question'></i></button>`;
                    }
                    return data;
                }
            }
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
                action: function (e, dt, button, config) {
                    // Abrir el modal de opciones de PDF
                    $('#pdfOptionsModal').modal('show');
                }
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
                    <button class='btn btn-sm btn-primary btn-edit centered' data-table-id="${tableId}"><i class='fa-solid fa-pencil'></i></button>
                    <button class='btn btn-sm btn-danger delete-asset-btn centered' data-id="${row.id}" data-table-id="${tableId}"><i class='fa-solid fa-trash-can'></i></button>
                `;
                return buttons;
            }
        });

        baseConfig.columnDefs.push({
            targets: [-1], // Apunta a la última columna (acciones)
            orderable: false,
            searchable: false
        });
    }

    return baseConfig;
}

const initDataTable = async (tableId = "datatable-assets", includeActions = true) => {
    try {
        if (dataTable[tableId]) {
            dataTable[tableId].destroy();
            dataTable[tableId] = null; // Eliminar la referencia para la recolección de basura
        }

        const dataTableOptions = getDataTableConfig(includeActions, tableId);
        dataTable[tableId] = $(`#${tableId}`).DataTable(dataTableOptions);
    } catch (error) {
        console.error("Error initializing DataTable:", error);
        Swal.fire('Error!', 'Error al inicializar la tabla.', 'error');
    }
};

$(document).on('click', '.delete-asset-btn', function () {
    const assetId = $(this).data('id');
    const tableId = $(this).data('table-id');

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
                    "X-CSRFToken": getCookie("csrftoken")
                },
                success: function (response) {
                    Swal.fire('Eliminado!', response.message, 'success');
                    if (dataTable[tableId]) {
                        dataTable[tableId].ajax.reload(null, false);
                    } else {
                        console.error("No se encontró la instancia de DataTables para la tabla:", tableId);
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    Swal.fire('Error!', "Error al eliminar el activo: " + (jqXHR.responseJSON?.error || "Error desconocido"), 'error');
                }
            });
        }
    });
});

$(document).ready(function () {
    $('#pdfOptionsModal').on('shown.bs.modal', function () {
        $('.js-example-basic-multiple').select2({
            width: '100%',
            dropdownParent: $('#pdfOptionsModal'), // ¡IMPORTANTE para modales!
            placeholder: "Seleccione categorías",
            closeOnSelect: false,
            theme: 'default' // Usa el tema por defecto (sin Bootstrap 5)

        });
        $('.brand').select2({
            width: '100%',
            dropdownParent: $('#pdfOptionsModal'), // ¡IMPORTANTE para modales!
            placeholder: "Seleccione marcas",
            closeOnSelect: false,
            theme: 'default' // Usa el tema por defecto (sin Bootstrap 5)

        });
    });

    // Limpiar al cerrar el modal (opcional)
    $('#pdfOptionsModal').on('hidden.bs.modal', function () {
        $('.js-example-basic-multiple').val(null).trigger('change');
    });
    // Manejar el clic en el botón "Generar PDF" del modal
    $('#generatePdfButton').on('click', function () {
        // Obtener las opciones seleccionadas
        const statusFilter = $('select[name="statusFilter"]').val();
        const categories = $('.js-example-basic-multiple').val() || [];
        const brand = $('.brand').val() || [];

        // Cerrar el modal
        $('#pdfOptionsModal').modal('hide');

        // Mostrar el indicador de carga
        $("#loading-indicator").show();

        // Realizar la solicitud AJAX con las opciones de filtrado
        $.ajax({
            url: 'http://127.0.0.1:8000/inventory/list_assets/',
            type: 'GET',
            data: {
                status: statusFilter,
                'categories[]': categories, // Cambia 'category' por 'categories[]'
                'brand[]': brand,
                all: true  // Para obtener todos los datos filtrados
            },
            success: function (response) {
                // Procesar los datos filtrados
                const data = response.Asset.map(asset => [
                    asset.id,
                    asset.fk_brand,
                    asset.model,
                    asset.fk_category,
                    asset.serial_number,
                    asset.state_asset,
                    asset.status,
                    asset.observation,
                ]);

                // Generar el PDF con los datos filtrados
                const today = new Date();
                const formattedDateTime = today.toLocaleString();

                const docDefinition = {
                    content: [
                        // Logos en columnas
                        {
                            columns: [
                                {
                                    image: gobernacion, // Logo izquierdo (Base64 o URL)
                                    width: 80,
                                    alignment: 'left',
                                    margin: [0, 0, 0, 10]
                                },
                                {
                                    text: '',
                                    width: '*',
                                },
                                {
                                    image: logo, // Logo derecho (Base64 o URL)
                                    width: 80,
                                    alignment: 'right',
                                    margin: [0, 0, 0, 10]
                                }
                            ],
                            columnGap: 10
                        },
                        {
                            text: 'Lista de Bienes',
                            style: 'header',
                            alignment: 'center',
                            margin: [0, 10, 0, 20]
                        },
                        {
                            table: {
                                widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*'],
                                headerRows: 1,
                                body: [
                                    [
                                        { text: 'ID', style: 'tableHeader' },
                                        { text: 'Marca', style: 'tableHeader' },
                                        { text: 'Modelo', style: 'tableHeader' },
                                        { text: 'Categoría', style: 'tableHeader' },
                                        { text: 'Serial', style: 'tableHeader' },
                                        { text: 'Estado', style: 'tableHeader' },
                                        { text: 'Estatus', style: 'tableHeader' },
                                        { text: 'Observación', style: 'tableHeader' }
                                    ],
                                    ...data
                                ]
                            },
                            layout: 'lightHorizontalLines'
                        }
                    ],
                    styles: {
                        header: {
                            fontSize: 18,
                            bold: true,
                            color: '#2c3e50'
                        },
                        tableHeader: {
                            bold: true,
                            fontSize: 13,
                            color: '#34495e'
                        },
                        footer: {
                            fontSize: 10,
                            alignment: 'center',
                            color: '#666666'
                        }
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

                // Generar y descargar el PDF
                pdfMake.createPdf(docDefinition).download(`Lista_de_bienes_${formattedDateTime}.pdf`);
                $("#loading-indicator").hide();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error('Error fetching filtered data:', textStatus, errorThrown);
                Swal.fire('Error!', 'Error al generar el PDF.', 'error');
                $("#loading-indicator").hide();
            }
        });
    });
});

$(document).on('click', '.btn-inoperativo', function () {
    const observation = $(this).data('observation');
    $('#inoperativoModal .modal-body p').text(observation);
    $('#inoperativoModal').modal('show');
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
    await initDataTable("datatable-assets");
});