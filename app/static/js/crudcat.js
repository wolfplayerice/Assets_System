const initDataTableCategory = (() => {
    let dataTableCategory;
    let dataTableIsInitializedCategory = false;
    const $loadingIndicator = $("#loading-indicator");
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
                    url: `/category/delete_category/${categoryId}/`,
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

            const listCategoryUrl = document.getElementById('data-container').dataset.listCategoryUrl;

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

function generateBrandsPDF() {
    const pdfButton = $('#external-pdf-button');
    

    pdfButton.addClass('pdf-button-loading');
    pdfButton.prop('disabled', true);
    
    $.ajax({
        url: '/category/list_category/?all=true',
        type: 'GET',
        success: (response) => {
            const data = response.Category.map(category => [category.id, category.name]);
            const today = new Date();
            const formattedDateTime = today.toLocaleString();

            const docDefinition = {
                pageSize: 'LETTER',
                pageMargins: [40, 80, 40, 40],
                header: {
                    columns: [
                        { image: gobernacion, width: 60, alignment: 'left', margin: [20, 10, 0, 10] },
                        {
                            text: 'LISTA DE CATEGORIAS',
                            style: 'header',
                            alignment: 'center',
                            margin: [10, 20, 0, 20]
                        },
                        { image: logo, width: 60, alignment: 'right', margin: [10, 10, 10, 10] }
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
                                    text: cell,
                                    alignment: 'center',
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
                defaultStyle: {
                    fontSize: 12,
                    color: '#2c3e50'
                },
                footer: (currentPage, pageCount) => ({
                    text: `Página ${currentPage} de ${pageCount} | Fecha de impresión: ${formattedDateTime}`,
                    style: 'footer',
                    margin: [0, 10, 0, 0]
                })
            };


            const pdfDocGenerator = pdfMake.createPdf(docDefinition);
            pdfDocGenerator.getBlob((blob) => {
                // Animación de éxito
                pdfButton.removeClass('pdf-button-loading').addClass('pdf-button-success');
                setTimeout(() => {
                    pdfButton.removeClass('pdf-button-success');
                    pdfButton.prop('disabled', false);
                }, 2000);
                saveAs(blob, `Lista_de_Categorias_${formattedDateTime}.pdf`);
            });
        },
        error: (jqXHR, textStatus, errorThrown) => {
            console.error('Error fetching all data:', textStatus, errorThrown);
            // Animación de error
            pdfButton.removeClass('pdf-button-loading').addClass('pdf-button-error');
            setTimeout(() => {
                pdfButton.removeClass('pdf-button-error');
                pdfButton.prop('disabled', false);
            }, 2000);
            
            Swal.fire('Error!', 'Error al generar el PDF.', 'error');
        },
    });
}

$(document).on('click', '#external-pdf-button', function() {
    generateBrandsPDF();
});

$(document).on('click', '.edit-cat-btn', function () {
    const catId = $(this).data('id');
    const catName = $(this).data('name');

    $('#edit-cat-id').val(catId);
    $('#edit-cat-name').val(catName);

    $('#edit-cat-form').attr('action', `/category/category_edit/${catId}/`);

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