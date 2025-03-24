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
            columns: [
                { data: "user" },
                { data: "action"},
                { data: "description"},
                { data: "timestamp"}
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
                            url: listAuditUrl,
                            type: 'GET',
                            success: (response) => {
                                const data = response.audit.map(audit => [audit.user, audit.action, audit.description, audit.timestamp]);

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
                                            text: 'Auditoria',
                                            style: 'header',
                                            alignment: 'center',
                                            margin: [0, 10, 0, 20]
                                        },
                                        {
                                            table: {
                                                headerRows: 1,
                                                widths: ['*', '*'],
                                                body: [
                                                    [{ text: 'ID', style: 'tableHeader' }, { text: 'Nombre', style: 'tableHeader' }],
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
                                pdfMake.createPdf(docDefinition).download(`Auditoria_${formattedDateTime}.pdf`);
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
        });

        dataTableIsInitializedaudit = true;
    } catch (error) {
        console.error("Error initializing DataTable:", error);
        Swal.fire('Error!', 'Error al inicializar la tabla.', 'error');
    }
};

window.addEventListener('load', async () => {
    await initDataTableAudit("datatable-audit");
});