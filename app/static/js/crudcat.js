let dataTablecategory;
let dataTableIsInitializedcategory = false;

const initDataTablecategory = async () => {
    if (dataTableIsInitializedcategory) {
        dataTablecategory.destroy();
    }

    dataTablecategory = $("#datatable-cat").DataTable({
        serverSide: true,
        ajax: {
            url: "http://127.0.0.1:8000/category/list_category/",
            error: function (jqXHR, textStatus, errorThrown) {
                console.error("Error fetching data:", textStatus, errorThrown);
                alert("Error al cargar los datos. Por favor, inténtelo de nuevo.");
            },
        },
        columns: [
            {
                data: null,
                render: function (data, type, row, meta) {
                    return meta.row + meta.settings._iDisplayStart + 1;
                },
            },
            { data: "name" },
            {
                data: null,
                render: function (data, type, row) {
                    return `<button class='btn btn-sm btn-primary edit-btn' data-id='${row.id}'><i class='fa-solid fa-pencil'></i></button> <button class='btn btn-sm btn-danger delete-btn' data-id='${row.id}'><i class='fa-solid fa-trash-can'></i></button>`;
                },
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
                action: function (e, dt, button, config) {
                    $("#loading-indicator").show();

                    $.ajax({
                        url: 'http://127.0.0.1:8000/category/list_category/?all=true',
                        type: 'GET',
                        success: function (response) {
                            console.log(response);

                            var data = response.Category.map(function (category) {
                                return [category.name];
                            });

                            var table = $('<table style="width:100%;"></table>');
                            var thead = $('<thead><tr><th>Nombre</th></tr></thead>');
                            var tbody = $('<tbody></tbody>');

                            data.forEach(function (rowData) {
                                var row = $('<tr></tr>');
                                rowData.forEach(function (cellData) {
                                    row.append('<td>' + cellData + '</td>');
                                });
                                tbody.append(row);
                            });

                            table.append(thead);
                            table.append(tbody);

                            // Construir el cuerpo del PDF directamente con los datos de la tabla jQuery
                            var body = [];
                            // agregar header
                            body.push(['Nombre']);

                            // agregar data.
                            data.forEach(function (rowData) {
                                body.push(rowData);
                            });

                            var docDefinition = {
                                content: [{
                                    table: {
                                        body: body,
                                    },
                                },],
                            };

                            pdfMake.createPdf(docDefinition).download('categorias.pdf');
                            $("#loading-indicator").hide();
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            console.error('Error fetching all data:', textStatus, errorThrown, jqXHR.status, jqXHR.responseText);
                            alert('Error al generar el PDF. ' + textStatus + ' ' + jqXHR.status);
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

    dataTableIsInitializedcategory = true;
};
$(document).on('click', '.delete-btn', function () {
    var categoryId = $(this).data('id');
    //alerta personalizada con sweetalert
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
                url: `http://127.0.0.1:8000/category/delete_category/${categoryId}/`,
                type: 'DELETE',
                headers: {
                    "X-CSRFToken": getCookie("csrftoken") // Asegúrate de que esta función esté definida
                },
                success: function (response) {
                    Swal.fire(
                        'Eliminado!',
                        response.message,
                        'success'
                    );
                    dataTablecategory.ajax.reload(); // Recargar la tabla después de eliminar
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    Swal.fire(
                        'Error!',
                        "Error al eliminar la categoría: " + (jqXHR.responseJSON?.error || "Error desconocido"),
                        'error'
                    );
                }
            });
        }
    });
});

// Función para obtener el valor de la cookie CSRF
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Verifica si el cookie comienza con el nombre que buscas
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
window.addEventListener('load', async () => {
    await initDataTablecategory();
});