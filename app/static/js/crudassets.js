let dataTable = {}; // Inicializamos dataTable como un objeto

function getDataTableConfig(includeActions = true, tableId = "datatable-assets") {
    const baseConfig = {
        ajax: {
            url: "http://127.0.0.1:8000/inventory/list_assets/",
            dataSrc: 'data'
        },
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
                action: (e, dt, button, config) => {
                    $("#loading-indicator").show();
                    $.ajax({
                        url: 'http://127.0.0.1:8000/inventory/list_assets/?all=true',
                        type: 'GET',
                        success: (response) => {
                            const data = response.Asset.map(asset => [asset.id ,asset.fk_brand, asset.model, 
                                asset.fk_category, asset.serial_number, asset.state_asset, asset.observation, asset.status
                            ]);

                            // Obtener la fecha actual
                            const today = new Date();

                            // Obtener componentes de la fecha y hora
                            /* const day = String(today.getDate()).padStart(2, '0'); // Día (2 dígitos)
                            const month = String(today.getMonth() + 1).padStart(2, '0'); // Mes (2 dígitos)
                            const year = today.getFullYear(); // Año (4 dígitos)
                            const hours = String(today.getHours()).padStart(2, '0'); // Hora (2 dígitos)
                            const minutes = String(today.getMinutes()).padStart(2, '0'); // Minutos (2 dígitos)
                            const seconds = String(today.getSeconds()).padStart(2, '0'); */ // Segundos (2 dígitos)

                            // Formato personalizado: DD-MM-YYYY HH:MM:SS
                            /* const formattedDateTime = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`; */
                            const formattedDateTime = today.toLocaleString();
                            const docDefinition = {
                                content: [
                                    // Logos en columnas
                                    {
                                        columns: [
                                            {
                                                image: gobernacion, // Logo izquierdo (Base64 o URL)
                                                width: 80, // Ancho de la imagen
                                                alignment: 'left', // Alineación a la izquierda
                                                margin: [0, 0, 0, 10] // Margen de la imagen
                                            },
                                            {
                                                text: '', // Columna vacía para separar los logos
                                                width: '*', // Ocupa el espacio restante
                                            },
                                            {
                                                image: logo, // Logo derecho (Base64 o URL)
                                                width: 80, // Ancho de la imagen
                                                alignment: 'right', // Alineación a la derecha
                                                margin: [0, 0, 0, 10] // Margen de la imagen
                                            }
                                        ],
                                        columnGap: 10 // Espacio entre columnas (opcional)
                                    },
                                    {
                                        text: 'Lista de Categorías',
                                        style: 'header',
                                        alignment: 'center',
                                        margin: [0, 10, 0, 20]
                                    },
                                    {
                                        table: {
                                            headerRows: 1,
                                            body: [
                                                [{ text: 'ID', style: 'tableHeader' },{ text: 'Marca', style: 'tableHeader' }, 
                                                { text: 'Modelo', style: 'tableHeader' },{ text: 'Categoria', style: 'tableHeader' },
                                                { text: 'Serial', style: 'tableHeader' },{ text: 'BBVA', style: 'tableHeader' },
                                                { text: 'Estatus', style: 'tableHeader' },{ text: 'Observación', style: 'tableHeader' },
                                                ],
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
                                    },
                                    footer: {
                                        fontSize: 10,
                                        alignment: 'center',
                                        color: '#666666' // Color del texto del pie de página
                                    }
                                },
                                defaultStyle: {
                                    fontSize: 12,
                                    color: '#2c3e50' // Color del texto por defecto
                                },
                                footer: (currentPage, pageCount) => {
                                    return {
                                        text: `Página ${currentPage} de ${pageCount} | Fecha de impresión: ${formattedDateTime}`,
                                        style: 'footer',
                                        margin: [0, 10, 0, 0] // Margen del pie de página
                                    };
                                }
                            };

                            // Generar y descargar el PDF con un nombre personalizado
                            pdfMake.createPdf(docDefinition).download(`Lista_de_bienes_${formattedDateTime}.pdf`);
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