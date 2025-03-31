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
                render: function (data, type, row, meta) {
                    if (type === 'display') {
                        return meta.settings._iDisplayStart + meta.row + 1;
                    }
                    return meta.row + 1;
                }
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
        buttons: [] // Eliminamos el botón PDF de DataTables
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
                    <button class='btn btn-sm btn-primary btn-edit centered' 
                        data-id="${row.id}" 
                        data-brand="${row.fk_brand}" 
                        data-brand-id="${row.fk_brand_id}" 
                        data-model="${row.model}" 
                        data-category="${row.fk_category}" 
                        data-category-id="${row.fk_category_id}"
                        data-serial="${row.serial_number}" 
                        data-state="${row.state_asset}" 
                        data-status="${row.status}" 
                        data-status-id="${row.status_id}"
                        data-observation="${row.observation}"
                        data-table-id="${tableId}">
                        <i class='fa-solid fa-pencil'></i>
                    </button>
                    <button class='btn btn-sm btn-danger delete-asset-btn centered' data-id="${row.id}" data-table-id="${tableId}"><i class='fa-solid fa-trash-can'></i></button>
                `;
                return buttons;
            }
        });

        baseConfig.columnDefs.push({
            targets: [-1],
            orderable: false,
            searchable: false
        });
    }

    return baseConfig;
}

const initDataTableAssets = async (tableId = "datatable-assets", includeActions = true) => {
    try {
        if (dataTable[tableId]) {
            dataTable[tableId].destroy();
            dataTable[tableId] = null;
        }

        const dataTableOptions = getDataTableConfig(includeActions, tableId);
        dataTable[tableId] = $(`#${tableId}`).DataTable(dataTableOptions);
    } catch (error) {
        console.error("Error initializing DataTable:", error);
        Swal.fire('Error!', 'Error al inicializar la tabla.', 'error');
    }
};

// Función para generar PDF con animaciones
async function generateAssetPDF() {
    const pdfButton = $('#external-pdf-button');
    const statusFilter = $('select[name="statusFilter"]').val();
    const categories = $('.js-example-basic-multiple').val() || [];
    const brand = $('.brand').val() || [];

    // Iniciar animación de carga
    pdfButton.addClass('pdf-button-loading').prop('disabled', true);

    try {
        const response = await $.ajax({
            url: '/inventory/list_assets/',
            type: 'GET',
            data: {
                status: statusFilter,
                'categories[]': categories,
                'brand[]': brand,
                all: true
            }
        });

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

        const today = new Date();
        const formattedDateTime = today.toLocaleString();

        const docDefinition = {
            pageSize: 'A4',
            pageOrientation: 'landscape',
            pageMargins: [40, 80, 40, 40],
            header: {
                columns: [
                    { image: gobernacion, width: 60, alignment: 'left', margin: [20, 10, 10, 10] },
                    {
                        text: 'INVENTARIO DE BIENES MUEBLES',
                        style: 'header',
                        alignment: 'center',
                        margin: [0, 20, 0, 20]
                    },
                    { image: logo, width: 60, alignment: 'right', margin: [10, 10, 20, 10] }
                ],
                columnGap: 10,
            },
            content: [
                {
                    table: {
                        widths: ['5%', '10%', '10%', '10%', '15%', '15%', '10%', '25%'],
                        headerRows: 1,
                        body: [
                            [
                                { text: 'ID', style: 'tableHeader', alignment: 'center' },
                                { text: 'Marca', style: 'tableHeader', alignment: 'center' },
                                { text: 'Modelo', style: 'tableHeader', alignment: 'center' },
                                { text: 'Categoría', style: 'tableHeader', alignment: 'center' },
                                { text: 'Serial', style: 'tableHeader', alignment: 'center' },
                                { text: 'Estado', style: 'tableHeader', alignment: 'center' },
                                { text: 'Estatus', style: 'tableHeader', alignment: 'center' },
                                { text: 'Observación', style: 'tableHeader', alignment: 'center' }
                            ],
                            ...data.map(row => row.map(cell => ({
                                text: cell,
                                alignment: 'justify',
                                noWrap: false,
                            })))
                        ]
                    },
                    layout: 'lightHorizontalLines'
                }
            ],
            styles: {
                header: { fontSize: 18, bold: true, color: '#2c3e50' },
                tableHeader: { bold: true, fontSize: 13, color: '#34495e' },
                footer: { fontSize: 10, alignment: 'center', color: '#666666' }
            },
            defaultStyle: { fontSize: 12, color: '#2c3e50' },
            footer: (currentPage, pageCount) => ({
                text: `Página ${currentPage} de ${pageCount} | Fecha de impresión: ${formattedDateTime}`,
                style: 'footer',
                margin: [0, 10, 0, 0]
            })
        };

        // Animación de éxito
        pdfButton.removeClass('pdf-button-loading').addClass('pdf-button-success');
        
        pdfMake.createPdf(docDefinition).download(`Inventario_bienes_${formattedDateTime}.pdf`);
        
        setTimeout(() => {
            pdfButton.removeClass('pdf-button-success').prop('disabled', false);
        }, 2000);

    } catch (error) {
        console.error('Error generando PDF:', error);
        
        // Animación de error
        pdfButton.removeClass('pdf-button-loading').addClass('pdf-button-error');
        setTimeout(() => {
            pdfButton.removeClass('pdf-button-error').prop('disabled', false);
        }, 2000);
        
        Swal.fire('Error!', 'Error al generar el PDF.', 'error');
    }
}

$(document).ready(function () {
    initDataTableAssets("datatable-assets");

    $('#external-pdf-button').on('click', function() {
        if ($(this).hasClass('pdf-button-loading')) return;
        $('#pdfOptionsModal').modal('show');
    });

    const pdfOptionsModal = $('#pdfOptionsModal');
    
    function initializeSelect2() {
        $('.js-example-basic-multiple').select2({
            width: '100%',
            dropdownParent: pdfOptionsModal,
            placeholder: "Seleccione categorías",
            closeOnSelect: false,
            theme: 'default'
        });

        $('.brand').select2({
            width: '100%',
            dropdownParent: pdfOptionsModal,
            placeholder: "Seleccione marcas",
            closeOnSelect: false,
            theme: 'default'
        });
    }

    function clearSelects() {
        $('.js-example-basic-multiple').val(null).trigger('change');
        $('.brand').val(null).trigger('change');
    }

    pdfOptionsModal.on('shown.bs.modal', initializeSelect2);
    pdfOptionsModal.on('hidden.bs.modal', clearSelects);
    
    // Botón de generación dentro del modal
    $('#generatePdfButton').on('click', function() {
        generateAssetPDF();
        pdfOptionsModal.modal('hide');
    });
});

// Resto de los event listeners (eliminación, edición, etc.)
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
                headers: { "X-CSRFToken": getCookie("csrftoken") },
                success: (response) => {
                    Swal.fire('Eliminado!', response.message, 'success');
                    if (dataTable[tableId]) {
                        dataTable[tableId].ajax.reload(null, false);
                    }
                },
                error: (jqXHR, textStatus, errorThrown) => {
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

function clearEditForm() {
    $('[name="fk_brand"], #id_fk_brand').val('').trigger('change');
    $('[name="model"], #id_model').val('');
    $('[name="fk_category"], #id_fk_category').val('').trigger('change');
    $('[name="serial_number"], #id_serial_number').val('');
    $('[name="state_asset"], #id_state_asset').val('');
    $('[name="observation"], #id_observation').val('');
    $('[name="prefix"], #id_prefix').val('').trigger('change');
    $('[name="status"], #id_status').val('True').trigger('change');
    
    $('#edit-form').attr('action', '');
}

$(document).on('click', '.btn-edit', function () {
    const assetId = $(this).data('id');
    const assetData = {
        fk_brand: $(this).data('brand-id'),
        model: $(this).data('model'),
        fk_category: $(this).data('category-id'),
        serial_number: $(this).data('serial'),
        state_asset: $(this).data('state'),
        status: $(this).data('status-id'),
        observation: $(this).data('observation') || ''
    };

    let prefix = '';
    let stateAssetValue = assetData.state_asset;
    
    if (assetData.state_asset?.includes('-')) {
        const parts = assetData.state_asset.split('-');
        prefix = parts[0] + '-';  
        stateAssetValue = parts[1]; 
    }

    $('[name="fk_brand"], #id_fk_brand').val(assetData.fk_brand).trigger('change');
    $('[name="model"], #id_model').val(assetData.model);
    $('[name="fk_category"], #id_fk_category').val(assetData.fk_category).trigger('change');
    $('[name="serial_number"], #id_serial_number').val(assetData.serial_number);
    $('[name="state_asset"], #id_state_asset').val(stateAssetValue || '');
    $('[name="observation"], #id_observation').val(assetData.observation);
    
    $('[name="prefix"], #id_prefix').val(prefix).trigger('change');
    const statusValue = assetData.status ? 'True' : 'False';
    $('[name="status"], #id_status').val(statusValue).trigger('change');

    $('#edit-form').attr('action', `/inventory/asset_edit/${assetId}/`);
    $('#editModal').modal('show');
});

$('#editModal').on('hidden.bs.modal', function () {
    clearEditForm();
});

$(document).on('submit', '#edit-form', function (e) {
    e.preventDefault();
    const form = $(this);
    const url = form.attr('action');
    const data = form.serialize();

    $.post(url, data, function (response) {
        if (response.status === 'success') {
            Swal.fire('Éxito', response.message, 'success').then(() => {
                location.reload();
                clearEditForm();
            });
        } else {
            Swal.fire('Error', response.message, 'error');
        }
    }).fail(function () {
        Swal.fire('Error', 'Ocurrió un error al procesar la solicitud.', 'error');
    });
});

$(document).on('submit', '#register-modal form', function (e) {
    e.preventDefault();
    const form = $(this);
    const url = form.attr('action');
    const data = form.serialize();

    $.post(url, data, function (response) {
        if (response.status === 'success') {
            Swal.fire('Éxito', response.message, 'success').then(() => {
                location.reload();
            });
        } else {
            Swal.fire('Error', response.message, 'error');
        }
    }).fail(function () {
        Swal.fire('Error', 'Ocurrió un error al procesar la solicitud.', 'error');
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
    await initDataTableAssets("datatable-assets");
});