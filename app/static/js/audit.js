let dataTableaudit;
let dataTableIsInitializedaudit = false;

var listAuditUrl = document.getElementById('data-container').getAttribute('data-list-audit-url');
const initDataTableAudit = async () => {
    try {
        if (dataTableIsInitializedaudit) {
            dataTableaudit.destroy();
            dataTableaudit = null; // Liberar referencia para la recolección de basura
        }

        dataTableaudit = $("#datatable-audit").DataTable({
            serverSide: true,
            processing: true,
            ajax: {
                url: listAuditUrl,
                error: (jqXHR, textStatus, errorThrown) => {
                    console.error("Error fetching data:", textStatus, errorThrown);
                    Swal.fire('Error!', 'Error al cargar los datos. Por favor, inténtelo de nuevo.', 'error');
                },
            },
            columnDefs: [
                {
                    targets: "_all",
                    className: 'dt-center', targets: "_all"
                },
            ],
            order: [[3, 'desc']],
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
                { data: "user" },
                { data: "action"},
                { data: "description"},
                { data: "timestamp"}
            ],
            serverSide: true,
            responsive: true,
            dom: "lBfrtip",
            buttons: [
            ],
        });

        dataTableIsInitializedaudit = true;
    } catch (error) {
        console.error("Error initializing DataTable:", error);
        Swal.fire('Error!', 'Error al inicializar la tabla.', 'error');
    }
};

async function generateAuditPDF() {
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
            url: '/audit/logs_list/?all=true',
            type: 'GET',
        });

        const data = response.data.map(audit => [audit.user, audit.action, audit.description, audit.timestamp]);


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
                        text: 'AUDITORIA',
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
                        widths: ['auto', 'auto', '*' , 'auto'],
                        body: [
                            [{ text: 'Usuario', style: 'tableHeader', alignment: 'center' },
                                { text: 'Acción', style: 'tableHeader', alignment: 'center' },
                                { text: 'Descripción', style: 'tableHeader', alignment: 'center'},
                                { text: 'Fecha y hora', style: 'tableHeader', alignment: 'center'}
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
            footer: function(currentPage, pageCount) {
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
            generateAuditPDF();
        } else {
            form.reportValidity();
        }
    });
});

window.addEventListener('load', async () => {
    await initDataTableAudit("datatable-audit");
});