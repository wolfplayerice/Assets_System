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
            serverSide: false,
            ajax: {
                url: "http://127.0.0.1:8000/audit/logs_list/",
                error: (jqXHR, textStatus, errorThrown) => {
                    console.error("Error fetching data:", textStatus, errorThrown);
                    Swal.fire('Error!', 'Error al cargar los datos. Por favor, inténtelo de nuevo.', 'error');
                },
            },
            columnDefs: [
                {
                    targets: "_all", orderable: false, searchable: false,
                    className: 'dt-center', targets: "_all"
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

function generateBrandsPDF() {
    const pdfButton = $('#external-pdf-button');

    pdfButton.addClass('pdf-button-loading');
    pdfButton.prop('disabled', true);
    
    $.ajax({
        url: '/audit/logs_list/?all=true',
        type: 'GET',
        success: (response) => {
            const data = response.data.map(audit => [audit.user, audit.action, audit.description, audit.timestamp]);

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
                pageSize: 'LETTER',
                pageMargins: [40, 80, 40, 40],
                header: {
                    columns: [
                        { image: gobernacion, width: 60, alignment: 'left', margin: [20, 10, 0, 10] },
                        {
                            text: 'LISTA DE AUDITORIA',
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
                            widths: ['auto', 'auto', '*' , 'auto'],
                            body: [
                                [{ text: 'Usuario', style: 'tableHeader', alignment: 'center' },
                                { text: 'Acción', style: 'tableHeader', alignment: 'center' },
                                { text: 'Descripción', style: 'tableHeader', alignment: 'center'},
                                { text: 'Fecha y hora', style: 'tableHeader', alignment: 'center'}
                                ],
                                ...data.map(row => row.map(cell => ({
                                    text: cell,
                                    alignment: 'center',
                                    noWrap: false,
                                })))
                            ],

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
                footer: (currentPage, pageCount) => {
                    return {
                        text: `Página ${currentPage} de ${pageCount} | Fecha de impresión: ${formattedDateTime}`,
                        style: 'footer',
                        margin: [0, 10, 0, 0]
                    };
                }
            };

            const pdfDocGenerator = pdfMake.createPdf(docDefinition);
            pdfDocGenerator.getBlob((blob) => {
                // Animación de éxito
                pdfButton.removeClass('pdf-button-loading').addClass('pdf-button-success');
                setTimeout(() => {
                    pdfButton.removeClass('pdf-button-success');
                    pdfButton.prop('disabled', false);
                }, 2000);
                saveAs(blob, `Auditoria_${formattedDateTime}.pdf`);
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

// Evento click para el botón externo de PDF
$(document).on('click', '#external-pdf-button', function() {
    generateBrandsPDF();
});

window.addEventListener('load', async () => {
    await initDataTableAudit("datatable-audit");
});