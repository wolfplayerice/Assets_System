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
                "infoFiltered": "(filtrado de un total de _MAX_ registros)",
                "sSearch": "Buscar:",
                "sProcessing": "Procesando...",
                "emptyTable": "No hay datos disponibles en la tabla",
            },
            columns: [
                { data: "user" },
                { data: "action" },
                { data: "description" },
                { data: "timestamp" }
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


// Función para generar el PDF de auditorías con opción de filtrado por fechas
function generateAuditPDF(startDate = null, endDate = null) {
    const pdfButton = $('#external-pdf-button');
    
    // Mostrar estado de carga
    pdfButton.addClass('pdf-button-loading');
    pdfButton.prop('disabled', true);

    // Construir la URL con los parámetros
    let url = `${listAuditUrl}?all=true`;
    if (startDate && endDate) {
        url += `&start_date=${startDate}&end_date=${endDate}`;
    }

    $.ajax({
        url: url,
        type: 'GET',
        success: (response) => {
            // Verificar si hay datos
            if (!response.data || response.data.length === 0) {
                Swal.fire('Información', 'No hay registros para el rango de fechas seleccionado.', 'info');
                pdfButton.removeClass('pdf-button-loading');
                pdfButton.prop('disabled', false);
                return;
            }

            // Formatear los datos para la tabla PDF
            const data = response.data.map(audit => [
                audit.user || 'N/A',
                audit.action || 'N/A',
                audit.description || 'N/A',
                audit.timestamp || 'N/A'
            ]);

            // Configuración del documento PDF
            const today = new Date();
            const formattedDateTime = today.toLocaleString();
            
            // Título basado en si hay filtro de fechas
            const titleText = startDate && endDate 
                ? `LISTADO DE AUDITORIAS (${startDate} al ${endDate})` 
                : 'LISTADO DE AUDITORIAS (Todos los registros)';

            const docDefinition = {
                pageSize: 'LETTER',
                pageMargins: [40, 80, 40, 40],
                header: {
                    columns: [
                        { image: gobernacion, width: 60, alignment: 'left', margin: [20, 10, 0, 10] },
                        {
                            text: titleText,
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
                            widths: ['auto', 'auto', '*', 'auto'],
                            body: [
                                [
                                    { text: 'Usuario', style: 'tableHeader', alignment: 'center' },
                                    { text: 'Acción', style: 'tableHeader', alignment: 'center' },
                                    { text: 'Descripción', style: 'tableHeader', alignment: 'center' },
                                    { text: 'Fecha y hora', style: 'tableHeader', alignment: 'center' }
                                ],
                                ...data.map(row => row.map(cell => ({
                                    text: cell,
                                    alignment: 'center',
                                    noWrap: false,
                                })))
                            ],
                        },
                        layout: 'Borders'
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

            // Generar el PDF
            const pdfDocGenerator = pdfMake.createPdf(docDefinition);
            pdfDocGenerator.getBlob((blob) => {
                // Mostrar estado de éxito
                pdfButton.removeClass('pdf-button-loading').addClass('pdf-button-success');
                setTimeout(() => {
                    pdfButton.removeClass('pdf-button-success');
                    pdfButton.prop('disabled', false);
                }, 2000);

                // Descargar el PDF
                const fileName = startDate && endDate 
                    ? `Auditoria_${startDate}_a_${endDate}.pdf` 
                    : `Auditoria_Completa_${formattedDateTime}.pdf`;
                
                saveAs(blob, fileName);
            });
        },
        error: (jqXHR, textStatus, errorThrown) => {
            console.error('Error al obtener datos:', textStatus, errorThrown);
            // Mostrar estado de error
            pdfButton.removeClass('pdf-button-loading').addClass('pdf-button-error');
            setTimeout(() => {
                pdfButton.removeClass('pdf-button-error');
                pdfButton.prop('disabled', false);
            }, 2000);

            Swal.fire('Error!', 'Ocurrió un error al generar el PDF.', 'error');
        },
    });
}

// Evento para abrir el modal de opciones PDF
$(document).on('click', '#external-pdf-button', function() {
    if ($(this).hasClass('pdf-button-loading')) return;
    
    // Resetear los campos de fecha al abrir el modal
    $('#startDate').val('');
    $('#endDate').val('');
    
    $('#pdfOptionsModal').modal('show');
});

// Evento para generar PDF desde el modal
$('#generatePdfButton').on('click', function(e) {
    e.preventDefault();
    
    const startDate = $('#startDate').val();
    const endDate = $('#endDate').val();
    
    // Validación de fechas
    if ((startDate && !endDate) || (!startDate && endDate)) {
        Swal.fire('Advertencia', 'Debes seleccionar ambas fechas o ninguna para filtrar.', 'warning');
        return;
    }
    
    // Validar que la fecha de inicio no sea mayor a la de fin
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        Swal.fire('Error', 'La fecha de inicio no puede ser mayor a la fecha final.', 'error');
        return;
    }
    
    $('#pdfOptionsModal').modal('hide');
    
    // Mostrar mensaje informativo si no hay filtro
    if (!startDate && !endDate) {
        Swal.fire({
            title: 'Generar reporte completo',
            text: 'Se generará un PDF con todos los registros de auditoría.',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Continuar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                generateAuditPDF();
            }
        });
    } else {
        generateAuditPDF(startDate, endDate);
    }
});

// Inicializar datepickers con opciones (opcional)
$(function() {
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    $('#startDate').attr('max', today.toISOString().split('T')[0]);
    $('#endDate').attr('max', today.toISOString().split('T')[0]);
    
    // Opcional: establecer valores por defecto (último mes)
    // $('#startDate').val(oneMonthAgo.toISOString().split('T')[0]);
    // $('#endDate').val(today.toISOString().split('T')[0]);
});

window.addEventListener('load', async () => {
    await initDataTableAudit("datatable-audit");
});