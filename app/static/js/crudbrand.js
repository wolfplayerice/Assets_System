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
                        <button class='btn btn-sm btn-primary edit-btn' data-id='${row.id}'>
                            <i class='fa-solid fa-pencil'></i>
                        </button>
                        <button class='btn btn-sm btn-danger delete-btn-brand' data-id='${row.id}'>
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
                            url: 'http://127.0.0.1:8000/brand/list_brand/?all=true',
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
                                            text: 'Lista de Marcas',
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
                                                        { text: 'ID', style: 'tableHeader' },
                                                        { text: 'Nombre', style: 'tableHeader', alignment: 'left' }
                                                    ],
                                                    ...data.map(row => [
                                                        { text: row[0], style: 'tableCell' },
                                                        { text: row[1], style: 'longTextCell' }
                                                    ])
                                                ]
                                            },
                                            layout: {
                                                hLineWidth: (i, node) => (i === 0 || i === node.table.body.length) ? 1 : 0.5,
                                                vLineWidth: () => 0.5,
                                                hLineColor: () => '#cccccc',
                                                vLineColor: () => '#cccccc',
                                                paddingTop: () => 5,
                                                paddingBottom: () => 5
                                            }
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
                                        tableCell: {
                                            fontSize: 11,
                                            color: '#333333',
                                            margin: [0, 5, 0, 5]
                                        },
                                        longTextCell: {
                                            fontSize: 11,
                                            color: '#333333',
                                            margin: [0, 5, 0, 5],
                                            alignment: 'left',
                                            lineHeight: 1.2
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
                                $("#loading-indicator").hide();
                            },
                        });
                    }},
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