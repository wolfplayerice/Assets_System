let dataTablebrand;
let dataTableIsInitializedbrand = false;

const dataTableOptionsbrand = {
    columnDefs: [

    ]
};

const initDataTablebrand = async () => {
    if (dataTableIsInitializedbrand) {
        dataTable.destroy();
    }

    await listBrands();

    dataTablebrand = $("#datatable-brand").DataTable(dataTableOptionsbrand);

    dataTableIsInitializedbrand = true;
};

const listBrands = async () => {
    try {
        const response = await fetch("http://127.0.0.1:8000/brand/list_brand/");
        const data = await response.json();

        let content = ``;
        data.Brand.forEach((brand, index) => {
            content += `
                <tr>
                    <td> ${index}</td>
                    <td> ${brand.name}</td>
                    <td>
                        <button class='btn btn-sm btn-primary'><i class='fa-solid fa-pencil'></i></button>
                        <button class='btn btn-sm btn-danger'><i class='fa-solid fa-trash-can'></i></button>
                    </td>
                </tr>
            `;
        });
        tablebody_brand.innerHTML = content;
    } catch (ex) {
    }
}

window.addEventListener('load', async () => {
    await initDataTablebrand();
});
