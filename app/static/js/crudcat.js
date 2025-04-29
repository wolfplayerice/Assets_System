const listCategoryUrl = document.getElementById('data-container').getAttribute('data-list-category-url');


const initDataTableCategory = (() => {
    let dataTableCategory;
    let dataTableIsInitializedCategory = false;
    const $datatableCat = $("#datatable-cat");

    const getCookie = name => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const handleDelete = function () {
        const categoryId = $(this).data('id');
        Swal.fire({
            title: '¿Estás seguro de eliminar este registro?',
            text: "No podrás revertir esto.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar!',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: deleteCatUrl.replace('0', categoryId),
                    type: 'DELETE',
                    headers: { "X-CSRFToken": getCookie("csrftoken") },
                    success: (response) => {
                        Swal.fire('Eliminado!', response.message, 'success');
                        dataTableCategory.ajax.reload(null, false); // No resetear paginación
                    },
                    error: (jqXHR) => {
                        Swal.fire('Error!', "Error al eliminar: " +
                            (jqXHR.responseJSON?.error || "Error desconocido"), 'error');
                    },
                });
            }
        });
    };

    return async () => {
        try {
            if (dataTableIsInitializedCategory) {
                dataTableCategory.destroy();
            }


            dataTableCategory = $datatableCat.DataTable({
                serverSide: true,
                processing: true,
                ajax: {
                    url: listCategoryUrl,
                    error: (jqXHR, textStatus, errorThrown) => {
                        console.error("Error:", textStatus, errorThrown);
                        Swal.fire('Error!', 'Error al cargar datos.', 'error');
                    },
                },
                columns: [
                    {
                        data: null,
                        render: (_, __, ___, meta) => meta.row + meta.settings._iDisplayStart + 1
                    },
                    { data: "name" },
                    {
                        data: null,
                        render: (data, type, row) => `
                            <button class='btn btn-sm btn-primary edit-cat-btn' 
                            data-id='${row.id}'
                            data-name='${row.name}'>
                                <i class='fa-solid fa-pencil'></i>
                            </button>
                            <button class='btn btn-sm btn-danger delete-btn-cat' data-id='${row.id}'>
                                <i class='fa-solid fa-trash-can'></i>
                            </button>`
                    }
                ],
                columnDefs: [
                    { targets: [2], orderable: false, searchable: false },
                    { className: 'dt-center', targets: "_all" }
                ],
                "language": {
                    "lengthMenu": "Mostrar _MENU_ registros",
                    "zeroRecords": "No se encontraron resultados",
                    "info": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
                    "infoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
                    "infoFiltered": "(filtrado de un total de _MAX_ registros)",
                    "sSearch": "Buscar:",
                    "sProcessing": "Procesando...",
                    "emptyTable": "No hay datos disponibles en la tabla"
                },
                responsive: true,
                dom: "lBfrtip",
                buttons: []
            });

            $datatableCat.on('click', '.delete-btn-cat', handleDelete);
            dataTableIsInitializedCategory = true;
        } catch (error) {
            console.error("Error:", error);
            Swal.fire('Error!', 'Error al inicializar tabla.', 'error');
        }
    };
})();

async function generateCatPDF() {
    const pdfButton = $('#external-pdf-button');


    // Obtener datos del receptor
    const receiverName = $('#receiverName').val();

    // Obtener datos del usuario logueado
    const issuerName = $('#pdfOptionsModal').data('user-name');

    const issuerVig = $('#receiverVig').val();

    const issuerAsset = $('#receiverAsset').val();


    // Iniciar animación de carga
    pdfButton.addClass('pdf-button-loading').prop('disabled', true);

    try {
        const response = await $.ajax({
            url: `${listCategoryUrl}?all=true`,
            type: 'GET',
        });

        const data = response.Category.map(category => [category.id, category.name]);


        const today = new Date();
        const formattedDateTime = today.toLocaleString();

        const docDefinition = {
            pageSize: 'LETTER',
            pageOrientation: 'landscape',
            pageMargins: [40, 80, 40, 130], // Ajustado el margen inferior para más espacio para las firmas
            header: {
                columns: [
                    { image: gobernacion, width: 60, alignment: 'left', margin: [20, 10, 10, 10] },
                    {
                        text: 'LISTADO DE CATEGORIAS',
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
                        headerRows: 1,
                        widths: ['auto', '*'],
                        body: [
                            [
                                { text: 'ID', style: 'tableHeader', alignment: 'center' },
                                { text: 'Nombre', style: 'tableHeader', alignment: 'center' },
                            ],
                            ...data.map(row => row.map(cell => ({
                                text: cell != null ? cell.toString() : '', // Asegurarse que sea string
                                alignment: 'center',
                                noWrap: false,
                            })))
                        ]
                    },

                }
            ],
            styles: {
                header: { fontSize: 18, bold: true, color: '#2c3e50' },
                tableHeader: { bold: true, fontSize: 13, color: '#34495e' },
                footer: { fontSize: 10, color: '#666666' },
                signature: { fontSize: 12, margin: [0, 20, 0, 0] } // Añadido margen superior a las firmas
            },
            defaultStyle: { fontSize: 12, color: '#2c3e50' },
            footer: function (currentPage, pageCount) {
                return {
                    stack: [
                        {
                            table: {
                                widths: ['*', '*', '*', '*'],
                                body: [
                                    [
                                        {
                                            text: `Entregado:\n\n\n_________________________\n${issuerName.toUpperCase()}`,
                                            alignment: 'center',
                                            style: 'signature',
                                            margin: [0, 15, 0, 5] // Margen: top, right, bottom, left
                                        },
                                        {
                                            text: `Recibido:\n\n\n_________________________\n${receiverName.toUpperCase()}`,
                                            alignment: 'center',
                                            style: 'signature',
                                            margin: [0, 15, 0, 5] // Margen: top, right, bottom, left
                                        },
                                        {
                                            text: `Vigilancia:\n\n\n_________________________\n${issuerVig.toUpperCase()}`,
                                            alignment: 'center',
                                            style: 'signature',
                                            margin: [0, 15, 0, 5] // Margen: top, right, bottom, left
                                        },
                                        {
                                            text: `Unidad de bienes:\n\n\n_________________________\n${issuerAsset.toUpperCase()}`,
                                            alignment: 'center',
                                            style: 'signature',
                                            margin: [0, 15, 0, 5] // Margen: top, right, bottom, left
                                        }
                                    ]
                                ]
                            },
                            layout: 'Borders',
                        },
                        {
                            text: `Página ${currentPage} de ${pageCount} | Fecha de impresión: ${formattedDateTime}`,
                            style: 'footer',
                            alignment: 'center',
                            margin: [0, 5, 0, 0] // Reducir margen superior si es necesario
                        }
                    ],
                    margin: [40, 0, 40, 10] // Margen general del footer: left, top, right, bottom
                };
            }
        };

        // Animación de éxito
        pdfButton.removeClass('pdf-button-loading').addClass('pdf-button-success');

        pdfMake.createPdf(docDefinition).download(`Inventario_bienes_${formattedDateTime.replace(/[/,:]/g, '-')}.pdf`);

        setTimeout(() => {
            pdfButton.removeClass('pdf-button-success').prop('disabled', false);
            $('#pdfOptionsModal').modal('hide');
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

    $('#external-pdf-button').on('click', function () {
        if ($(this).hasClass('pdf-button-loading')) return;
        $('#pdfOptionsModal').modal('show');
    });

    // Botón de generación dentro del modal
    $('#generatePdfButton').on('click', function (e) {
        e.preventDefault(); // Previene el comportamiento por defecto

        const form = document.getElementById('pdfOptionsForm');

        if (form.checkValidity()) {
            $('#pdfOptionsModal').modal('hide');
            generateCatPDF();
        } else {
            form.reportValidity();
        }
    });
});

$(document).on('click', '.edit-cat-btn', function () {
    const catId = $(this).data('id');
    const catName = $(this).data('name');

    $('#edit-cat-id').val(catId);
    $('#edit-cat-name').val(catName);

    $('#edit-cat-form').attr('action', editCatUrl.replace('0', catId));

    $('#editCatModal').modal('show');
});

$(document).on('click', '#save-changes', function () {
    $('#edit-cat-form').submit();
});

$(document).on('submit', '#edit-cat-form', function (e) {
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

window.addEventListener('load', initDataTableCategory);