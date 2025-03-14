let dataTablecategory;
let dataTableIsInitializedcategory = false;

const dataTableOptionscategory = {
    columnDefs: [

    ]
};

const initDataTablecategory = async () => {
    if (dataTableIsInitializedcategory) {
        dataTablecategory.destroy();
    }

    await listCategory();

    dataTablecategory = $("#datatable-cat").DataTable(dataTableOptionscategory);

    dataTableIsInitializedcategory = true;
};

const listCategory = async () => {
    try {
        const response = await fetch("http://127.0.0.1:8000/category/list_category/");
        const data = await response.json();

        let content = ``;
        data.Category.forEach((category, index) => {
            content += `
                <tr>
                    <td> ${index}</td>
                    <td> ${category.name}</td>
                    <td>
                        <button class='btn btn-sm btn-primary'><i class='fa-solid fa-pencil'></i></button>
                        <button class='btn btn-sm btn-danger'><i class='fa-solid fa-trash-can'></i></button>
                    </td>
                </tr>
            `;
        });
        tablebody_cat.innerHTML = content;
    } catch (ex) {
    }
}

window.addEventListener('load', async () => {
    await initDataTablecategory();
});
