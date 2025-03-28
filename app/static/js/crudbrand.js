let dataTablebrand;
let dataTableIsInitializedbrand = false;

var listBrandsUrl = document.getElementById('data-container').getAttribute('data-list-brands-url');
const initDataTablebrand = async () => {
    try {
        if (dataTableIsInitializedbrand) {
            dataTablebrand.destroy();
            dataTablebrand = null; // Liberar referencia para la recolección de basura
        }

        dataTablebrand = $("#datatable-brand").DataTable({
            serverSide: true,
            ajax: {
                url: listBrandsUrl,
                error: (jqXHR, textStatus, errorThrown) => {
                    console.error("Error fetching data:", textStatus, errorThrown);
                    Swal.fire('Error!', 'Error al cargar los datos. Por favor, inténtelo de nuevo.', 'error');
                },
            },
            columnDefs: [
                {
                    targets: [2], orderable: false, searchable: false,
                    className: 'dt-center', targets: "_all"
                },
            ],
            columns: [
                {
                    data: null,
                    render: (data, type, row, meta) => meta.row + meta.settings._iDisplayStart + 1,
                },
                { data: "name" },
                {
                    data: null,
                    render: (data, type, row) => `
                            <button class='btn btn-sm btn-primary edit-bra-btn' 
                            data-id='${row.id}'
                            data-name='${row.name}'>
                                <i class='fa-solid fa-pencil'></i>
                            </button>
                        <button class='btn btn-sm btn-danger delete-btn-brand' data-id='${row.id}'>
                            <i class='fa-solid fa-trash-can'></i>
                        </button>`,
                },
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
                    extend: 'pdfHtml5',
                    text: '<i class="fas fa-file-pdf"></i>',
                    titleAttr: 'Exportar a PDF',
                    className: 'btn btn-danger',
                    action: (e, dt, button, config) => {
                        $("#loading-indicator").show();
                        $.ajax({
                            url: '/brand/list_brand/?all=true',
                            type: 'GET',
                            success: (response) => {
                                const data = response.Brand.map(brand => [brand.id, brand.name]);
                                const today = new Date();
                                const formattedDateTime = today.toLocaleString();

                                const docDefinition = {
                                    content: [
                                        {
                                            columns: [
                                                { image: gobernacion, width: 80, alignment: 'left', margin: [0, 0, 0, 10] },
                                                { text: '', width: '*' },
                                                { image: logo, width: 80, alignment: 'right', margin: [0, 0, 0, 10] }
                                            ],
                                            columnGap: 10
                                        },
                                        {
                                            text: 'Lista de Categorias',
                                            style: 'header',
                                            alignment: 'center',
                                            margin: [0, 10, 0, 20]
                                        },
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

                                pdfMake.createPdf(docDefinition).download(`Lista_de_Categorias_${formattedDateTime}.pdf`);
                                $("#loading-indicator").hide();
                            },
                            error: (jqXHR, textStatus, errorThrown) => {
                                console.error('Error fetching all data:', textStatus, errorThrown);
                                Swal.fire('Error!', 'Error al generar el PDF.', 'error');
                            },
                        });
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
        });

        dataTableIsInitializedbrand = true;
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
                    dataTablebrand.ajax.reload();
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
    await initDataTablebrand();
});

$(document).on('click', '.edit-bra-btn', function () {
    const brandId = $(this).data('id');
    const brandName = $(this).data('name');

    $('#edit-bra-id').val(brandId);
    $('#edit-bra-name').val(brandName);

    // Establecer la acción del formulario dinámicamente
    $('#edit-bra-form').attr('action', `/brand/brand_edit/${brandId}/`);

    $('#editBraModal').modal('show');
});

$(document).on('click', '#save-changes', function () {
    $('#edit-bra-form').submit();
});