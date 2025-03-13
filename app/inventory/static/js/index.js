let dataTable;
let dataTableIsInitialized= false;

const initDataTable=async() => {
    if(dataTableIsInitialized){
        dataTable.destroy();
    }  

    await listAssets();

    dataTable=$("#datatable-assets").DataTable({});

    dataTableIsInitialized= true;
};

const listAssets=async () => {
    try {
        const response = await fetch("http://127.0.0.1:8000/inventory/list_assets/");
        const data = await response.json();

        let content= ``;
        data.Asset.forEach((asset, index) =>{
            content+=`
                <tr>
                    <td> ${index}</td>
                    <td> ${asset.fk_brand}</td>
                    <td> ${asset.model}</td>
                    <td> ${asset.fk_category}</td>
                    <td> ${asset.serial_number}</td>
                    <td> ${asset.state_asset}</td>
                    <td> ${asset.status}</td>
                </tr>
            `;
        });
        tablebody_assets.innerHTML=content;
    } catch (ex){
        alert(ex);
    }
}

window.addEventListener('load', async () => {
    await initDataTable();
});
