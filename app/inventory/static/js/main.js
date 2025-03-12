let dataTable;
let dataTableIsInitialized = false;

const dataTableOptions = {

}

const initDataTable = async () => {
    if (dataTableIsInitialized) {
        dataTable.destroy();
    }

    await listAssets();

    dataTable = $('#datatable-assets').DataTable({});

    dataTableIsInitialized = true;
}

const listAssets = async () => {
    try {
        const response = await fetch("http://127.0.0.1:8000/inventory/listAssets/");
        const data = await response.json();

        let content = ``;
        data.assets.forEach((asset) => {
            content += `
                <tr>
                    <td>${asset.model}</td>
                    <td>${asset.fk_brand}</td>
                    <td>${asset.fk_category}</td>
                    <td>${asset.serial_number}</td>
                    <td>${asset.state_asset}</td>
                    <td>${asset.status != true ? "ta malo" : "ta bueno"}</td>
                    <td>
                        <button class="btn btn-primary">Editar</button>
                        <button class="btn btn-danger"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `;
        });
        document.getElementById('tableBody_assets').innerHTML = content;
    } catch (ex) {
        alert(ex);
    }
};

window.addEventListener("load", async () => {
    await initDataTable();
});