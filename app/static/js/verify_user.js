window.addEventListener('load', function () {
    const successMessage = document.getElementById('success-message');
    const errorMessage = document.getElementById('error-message');

    if (successMessage) {
        Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: successMessage.textContent
        });
    }

    if (errorMessage) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMessage.textContent
        });
    }
});


// funciones de la tabla usuarios, las meto aca porque ya esto trata de usuarios y que ladilla hacer otro archivo

let dataTableUser;
let dataTableIsInitializedUser = false;

const initDataTableUser = async () => {
    try {
        if (dataTableIsInitializedUser) {
            dataTableUser.destroy();
            dataTableUser = null; // Liberar referencia para la recolección de basura
        }

        dataTableUser = $("#datatable-users").DataTable({
            serverSide: true,
            ajax: {
                url: "http://127.0.0.1:8000/users/list_user/",
                error: (jqXHR, textStatus, errorThrown) => {
                    console.error("Error fetching data:", textStatus, errorThrown);
                    Swal.fire('Error!', 'Error al cargar los datos. Por favor, inténtelo de nuevo.', 'error');
                },
            },
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
                        <button class='btn btn-sm btn-danger delete-btn' data-id='${row.id}'>
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
                            url: 'http://127.0.0.1:8000/users/list_user/?all=true',
                            type: 'GET',
                            success: (response) => {
                                const data = response.User.map(user => [user.id, user.username, user.first_name, user.last_name, user.is_active]);
                                const docDefinition = {
                                    content: [
                                        { text: 'Lista de Usuarios', style: 'header', alignment: 'center', margin: [0, 10, 0, 20] },
                                        { table: { body: [['ID', 'Nombre'], ...data] } },
                                    ],
                                    styles: { header: { fontSize: 18, bold: true } },
                                };
                                pdfMake.createPdf(docDefinition).open();
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

        dataTableIsInitializedUser = true;
    } catch (error) {
        console.error("Error initializing DataTable:", error);
        Swal.fire('Error!', 'Error al inicializar la tabla.', 'error');
    }
};