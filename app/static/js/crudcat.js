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

    const handleDelete = function() {
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

    const generatePDF = (data) => {
        const today = new Date();
        const docDefinition = {
            content: [
                // Contenido del PDF (optimizado)
            ],
            styles: {
                // Estilos (optimizados)
            }
        };
        pdfMake.createPdf(docDefinition).download(`Lista_Categorias_${today.toLocaleDateString()}.pdf`);
        $loadingIndicator.hide();
    };

    return async () => {
        try {
            if (dataTableIsInitializedCategory) {
                dataTableCategory.destroy();
            }

            const listCategoryUrl = document.getElementById('data-container').dataset.listCategoryUrl;
            
            dataTableCategory = $datatableCat.DataTable({
                serverSide: true,
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
                "infoFiltered": "(filtrado de un total de MAX registros)",
                "sSearch": "Buscar:",
                "sProcessing": "Procesando...",
                "emptyTable": "No hay datos disponibles en la tabla"
                },
                responsive: true,
                dom: "lBfrtip",
                buttons: [
                    {
                        extend: "excelHtml5",
                        text: '<i class="fas fa-file-excel"></i>',
                        titleAttr: "Exportar a Excel",
                        className: "btn btn-success",
                        exportOptions: { columns: [0, 1] }
                    },
                    {
                        extend: 'pdfHtml5',
                        text: '<i class="fas fa-file-pdf"></i>',
                        titleAttr: 'Exportar a PDF',
                        className: 'btn btn-danger',
                        action: function() {
                            $loadingIndicator.show();
                            $.get('/category/list_category/?all=true')
                                .done(response => generatePDF(response.Category))
                                .fail(() => {
                                    Swal.fire('Error!', 'Error al generar PDF.', 'error');
                                    $loadingIndicator.hide();
                                });
                        }
                    },
                    {
                        extend: "print",
                        text: '<i class="fa fa-print"></i>',
                        titleAttr: "Imprimir",
                        className: "btn btn-info",
                        exportOptions: { columns: [0, 1] }
                    }
                    
                ]
            });

            $datatableCat.on('click', '.delete-btn-cat', handleDelete);
            dataTableIsInitializedCategory = true;
        } catch (error) {
            console.error("Error:", error);
            Swal.fire('Error!', 'Error al inicializar tabla.', 'error');
        }
    };
})();

$(document).on('click', '.edit-cat-btn', function () {
    const catId = $(this).data('id');
    const catName = $(this).data('name');

    $('#edit-cat-id').val(catId);
    $('#edit-cat-name').val(catName);

    // Establecer la acción del formulario dinámicamente
    $('#edit-cat-form').attr('action', `/category/category_edit/${catId}/`);

    $('#editCatModal').modal('show');
});

$(document).on('click', '#save-changes', function () {
    $('#edit-cat-form').submit();
});

window.addEventListener('load', initDataTableCategory);