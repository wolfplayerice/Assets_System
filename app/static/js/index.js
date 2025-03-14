let dataTable;
let dataTableIsInitialized= false;

const dataTableOptions={
    columnDefs:[
        { targets: [0,1,2,3,4,5,6,7], classname:"centered" },
        { targets: [7], orderable: false },
        { targets: [7], searchable: false }
    ]
};

const initDataTable=async() => {
    if(dataTableIsInitialized){
        dataTable.destroy();
    }  

    await listAssets();

    dataTable=$("#datatable-assets").DataTable(dataTableOptions);

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
                    <td>
                        <button class='btn btn-sm btn-primary'><i class='fa-solid fa-pencil'></i></button>
                        <button class='btn btn-sm btn-danger'><i class='fa-solid fa-trash-can'></i></button>
                    </td>
                </tr>
            `;
        });
        tablebody_assets.innerHTML=content;
    } catch (ex){
    }
}

window.addEventListener('load', async () => {
    await initDataTable();
});
