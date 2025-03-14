let dataTable;
let dataTableIsInitialized= false;

const dataTableOptions={
    columnDefs:[
        { targets: [7], orderable: false },
        { targets: [7], searchable: false },
        { targets: [7], className: 'dt-center'}
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
                    <td class='centered'> ${index}</td>
                    <td class='centered'> ${asset.fk_brand}</td>
                    <td class='centered'> ${asset.model}</td>
                    <td class='centered'> ${asset.fk_category}</td>
                    <td class='centered'> ${asset.serial_number}</td>
                    <td class='centered'> ${asset.state_asset}</td>
                    <td class='centered'> ${asset.status}</td>
                    <td>
                        <button class='btn btn-sm btn-primary centered'><i class='fa-solid fa-pencil'></i></button>
                        <button class='btn btn-sm btn-danger centered'><i class='fa-solid fa-trash-can'></i></button>
                    </td>
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
