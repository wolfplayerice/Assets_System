let dataTableBackups;
let dataTableIsInitializedBackups = false;

const listBackupsUrl = "/backup/list/";
const createBackupUrl = "/backup/create/";
const restoreBackupUrl = "/backup/restore/";
const deleteBackupUrl = "/backup/delete/";

const initDataTableBackups = async () => {
    try {
        if (dataTableIsInitializedBackups) {
            dataTableBackups.destroy();
            dataTableBackups = null;
        }

        dataTableBackups = $("#datatable-backups").DataTable({
            serverSide: true,
            processing: true,
            ajax: {
                url: listBackupsUrl,
                error: (jqXHR, textStatus, errorThrown) => {
                    console.error("Error fetching data:", textStatus, errorThrown);
                    Swal.fire('Error!', 'Error al cargar los respaldos. Por favor, inténtelo de nuevo.', 'error');
                },
            },
            columnDefs: [
                {
                    targets: [3],
                    orderable: false,
                    searchable: false,
                    className: 'dt-center'
                },
                {
                    className: 'dt-center',
                    targets: "_all"
                },
            ],
            columns: [
                {
                    data: "name",
                    render: function(data, type, row) {
                        return `<span class="backup-name">${data}</span>`;
                    }
                },
                {
                    data: "size"
                },
                {
                    data: "date"
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        return `
                            <div class="btn-group" role="group">
                                <button class="btn btn-sm btn-success restore-btn" 
                                    data-path="${row.path}" 
                                    title="Restaurar">
                                    <i class="fas fa-undo"></i>
                                </button>
                                <button class="btn btn-sm btn-danger delete-btn ml-1" 
                                    data-path="${row.path}" 
                                    title="Eliminar">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        `;
                    }
                }
            ],
            language: {
                lengthMenu: "Mostrar _MENU_ registros",
                zeroRecords: "No se encontraron respaldos",
                info: "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
                infoEmpty: "Mostrando registros del 0 al 0 de un total de 0 registros",
                infoFiltered: "(filtrado de un total de _MAX_ registros)",
                sSearch: "Buscar:",
                sProcessing: "Procesando...",
                emptyTable: "No hay respaldos disponibles",
            },
            responsive: true,
            dom: "<'row'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'f>>" +
                "<'row'<'col-sm-12'tr>>" +
                "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
            order: [[2, 'desc']]
        });

        dataTableIsInitializedBackups = true;
    } catch (error) {
        console.error("Error initializing DataTable:", error);
        Swal.fire('Error!', 'Error al inicializar la tabla de respaldos.', 'error');
    }
};

function generateBackupsPDF() {
    const pdfButton = $('#external-pdf-button');
    pdfButton.addClass('pdf-button-loading');
    pdfButton.prop('disabled', true);

    $.ajax({
        url: listBackupsUrl + '?all=true',
        type: 'GET',
        success: (response) => {
            const data = response.backups.map(backup => [
                backup.name,
                backup.size,
                backup.date,
                backup.encrypted ? 'Sí' : 'No'
            ]);

            const today = new Date();
            const formattedDateTime = today.toLocaleString();

            const docDefinition = {
                pageSize: 'LETTER',
                pageMargins: [40, 80, 40, 40],
                header: {
                    text: 'REPORTE DE RESPALDOS',
                    style: 'header',
                    alignment: 'center',
                    margin: [0, 20, 0, 20]
                },
                content: [
                    {
                        text: `Base de datos: ${response.db_name || 'Desconocida'}`,
                        style: 'subheader',
                        margin: [0, 0, 0, 10]
                    },
                    {
                        table: {
                            headerRows: 1,
                            widths: ['*', 'auto', 'auto', 'auto'],
                            body: [
                                [
                                    { text: 'Nombre', style: 'tableHeader' },
                                    { text: 'Tamaño', style: 'tableHeader' },
                                    { text: 'Fecha', style: 'tableHeader' },
                                    { text: 'Encriptado', style: 'tableHeader' }
                                ],
                                ...data
                            ]
                        },
                        layout: 'lightHorizontalLines'
                    }
                ],
                styles: {
                    header: { fontSize: 18, bold: true, color: '#2c3e50' },
                    subheader: { fontSize: 14, bold: false, color: '#34495e' },
                    tableHeader: { bold: true, fontSize: 12, color: '#34495e' },
                    footer: { fontSize: 10, alignment: 'center', color: '#666666' }
                },
                defaultStyle: {
                    fontSize: 11,
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
                pdfButton.removeClass('pdf-button-loading').addClass('pdf-button-success');
                setTimeout(() => {
                    pdfButton.removeClass('pdf-button-success');
                    pdfButton.prop('disabled', false);
                }, 2000);

                saveAs(blob, `Respaldo_BD_${formattedDateTime}.pdf`);
            });
        },
        error: (jqXHR, textStatus, errorThrown) => {
            console.error('Error fetching all data:', textStatus, errorThrown);
            pdfButton.removeClass('pdf-button-loading').addClass('pdf-button-error');
            setTimeout(() => {
                pdfButton.removeClass('pdf-button-error');
                pdfButton.prop('disabled', false);
            }, 2000);

            Swal.fire('Error!', 'Error al generar el PDF.', 'error');
        }
    });
}

// Evento para crear backup
$(document).on('submit', '#create-backup-form', function (e) {
    e.preventDefault();
    const form = $(this);
    const submitButton = form.find('button[type="submit"]');

    submitButton.prop('disabled', true);
    submitButton.html('<i class="fas fa-spinner fa-spin"></i> Creando respaldo...');

    Swal.fire({
        title: 'Creando respaldo',
        html: 'Por favor espere mientras se crea el respaldo...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    $.ajax({
        url: createBackupUrl,
        type: 'POST',
        data: form.serialize(),
        success: (response) => {
            Swal.fire({
                title: '¡Éxito!',
                text: response.message,
                icon: 'success'
            });
            dataTableBackups.ajax.reload(null, false);
        },
        error: (jqXHR) => {
            let errorMsg = jqXHR.responseJSON?.message || 'Error al crear el respaldo';
            if (jqXHR.status === 403) {
                errorMsg = 'No tiene permisos para esta acción';
            }
            Swal.fire('Error', errorMsg, 'error');
        },
        complete: () => {
            submitButton.prop('disabled', false);
            submitButton.html('<i class="fas fa-plus-circle"></i> Crear Nuevo Respaldo');
        }
    });
});

// Evento para restaurar backup
$(document).on('click', '.restore-btn', function () {
    const backupPath = $(this).data('path');
    const backupName = $(this).closest('tr').find('.backup-name').text();

    Swal.fire({
        title: '¿Restaurar respaldo?',
        html: `Estás a punto de restaurar: <b>${backupName}</b><br><br>
            <span class="text-danger">¡ADVERTENCIA! Esto sobrescribirá la base de datos actual.</span>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, restaurar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Restaurando...',
                html: 'Por favor espere',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                    
                    $.ajax({
                        url: restoreBackupUrl,
                        type: 'POST',
                        data: {
                            'backup_path': backupPath,
                            'csrfmiddlewaretoken': getCookie('csrftoken')
                        },
                        success: (response) => {
                            Swal.fire({
                                title: '¡Éxito!',
                                text: 'La base de datos se restauró correctamente. Serás redirigido para iniciar sesión nuevamente.',
                                icon: 'success'
                            }).then(() => {
                                sessionStorage.setItem('restore_success', 'true');
                                window.location.href = '/login/';
                            });
                        },
                        error: (jqXHR) => {
                            Swal.hideLoading();
                            let errorMsg = jqXHR.responseJSON?.message || 'Error al restaurar';
                            if (jqXHR.status === 400) {
                                errorMsg = 'Error de desencriptación: ' + errorMsg;
                            }
                            Swal.fire('Error', errorMsg, 'error');
                        }
                    });
                }
            });
        }
    });
});

// Evento para eliminar backup
$(document).on('click', '.delete-btn', function () {
    const backupPath = $(this).data('path');
    const backupName = $(this).closest('tr').find('.backup-name').text();

    Swal.fire({
        title: '¿Eliminar respaldo?',
        html: `Estás a punto de eliminar permanentemente: <b>${backupName}</b>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Eliminando...',
                html: 'Por favor espere',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            $.ajax({
                url: deleteBackupUrl,
                type: 'POST',
                data: {
                    'backup_path': backupPath,
                    'csrfmiddlewaretoken': getCookie('csrftoken')
                },
                success: (response) => {
                    Swal.fire({
                        title: '¡Eliminado!',
                        text: response.message,
                        icon: 'success'
                    });
                    dataTableBackups.ajax.reload(null, false);
                },
                error: (jqXHR) => {
                    const errorMsg = jqXHR.responseJSON?.message || 'Error al eliminar';
                    Swal.fire('Error', errorMsg, 'error');
                }
            });
        }
    });
});

// Evento para generar PDF
$(document).on('click', '#external-pdf-button', function () {
    generateBackupsPDF();
});

// Función para obtener cookies
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

// Inicialización al cargar la página
window.addEventListener('load', async () => {
    await initDataTableBackups();
});