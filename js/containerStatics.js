let globalSheetData = [];


document.addEventListener('DOMContentLoaded', function () {

    // 添加事件监听器
    document.getElementById('warehouseSelector').addEventListener('change', filterData);
    document.getElementById('deliverySelector').addEventListener('change', filterData);
    document.getElementById('etaStartDatePicker').addEventListener('change', filterData);
    document.getElementById('etaEndDatePicker').addEventListener('change', filterData);

    // 新增操作类型复选框事件监听
    document.getElementById('operationTypeUnload').addEventListener('change', filterData);
    document.getElementById('operationTypeDirect').addEventListener('change', filterData);



    // 初始化页面数据
    fetchGoogleSheetData(oakUrl);

});



//从google_sheet获取数据  奥克兰调度表yg2024的数据
const oakUrl = 'https://script.google.com/macros/s/AKfycbwjCTMK_AgsZ_pF2Wst-toewOHv_7mDiQFCuIa-FqsFeb5fakz5mXXPvSrsyYSMyv2wvw/exec'; // 替换为你的Apps Script Web应用URL

//抓取调度表的json数据
async function fetchGoogleSheetData(url) {
    try {
        // 显示加载指示器
        document.getElementById('loadingIndicator').style.display = 'block';

        const response = await fetch(url);
        const { data } = await response.json(); // 从Google Sheets获取数据


        // 隐藏加载指示器
        document.getElementById('loadingIndicator').style.display = 'none';

        console.log(data);
        globalSheetData = data;

        populateWarehouseOptions(globalSheetData);
        populateDestinationOptions(globalSheetData);

        displayData(globalSheetData);
    } catch (error) {
        console.error('Error fetching data:', error);
        // 发生错误时也要隐藏加载指示器
        document.getElementById('loadingIndicator').style.display = 'none';

    }
}

// 显示数据
function displayData(data) {

    var containerInfoBody = document.getElementById('containerInfoBody');

    containerInfoBody.innerHTML = ''; // 清空表格内容

    const filteredData = data.filter(container => container.柜号);

    //打印筛选过后的数据
    console.log(filteredData);

    // 更新柜子数量
    var countNumber = document.getElementById('countNumber');
    countNumber.textContent = filteredData.length; // 显示柜子的数量

    data.filter(container => container.柜号)
        .forEach((container, index) => {
            var row = document.createElement('tr');
            row.innerHTML = `
            <th style="vertical-align: middle;" scope="row">${index}</th>
            <td style="vertical-align: middle;">${container.柜号}</td>
            <td style="vertical-align: middle;">${container.客户}</td>
            <td style="vertical-align: middle;">${container.eta.substr(0, 10)}</td>
            <td style="vertical-align: middle;">${container.操作方式} ${container.送货地}</td>
            `;
            containerInfoBody.appendChild(row);
        });
}

//填充仓号的 <datalist>
function populateWarehouseOptions(data) {
    const warehouseOptionsSet = new Set();

    data.forEach(container => {
        for (let i = 0; i < 10; i++) {
            let unloadingPlace = container[`客户`];
            // 确保unloadingPlace是一个字符串
            if (typeof unloadingPlace === 'string') {
                unloadingPlace = unloadingPlace.trim();
                warehouseOptionsSet.add(unloadingPlace);
            }
        }
    });

    const warehouseList = document.getElementById('warehouseList');
    warehouseList.innerHTML = ''; // 清空现有选项
    warehouseOptionsSet.forEach(warehouse => {
        const option = document.createElement('option');
        option.value = warehouse;
        warehouseList.appendChild(option);
    });
}

//填充送货地的 <datalist>
function populateDestinationOptions(data) {
    const destinationOptionsSet = new Set();

    data.forEach(container => {
        for (let i = 0; i < 10; i++) {
            let deliveryPlace = container[`送货地`];
            // 确保unloadingPlace是一个字符串
            if (typeof deliveryPlace === 'string') {
                deliveryPlace = deliveryPlace.trim();
                destinationOptionsSet.add(deliveryPlace);
            }
        }
    });

    const deliveryList = document.getElementById('deliveryList');
    deliveryList.innerHTML = ''; // 清空现有选项
    destinationOptionsSet.forEach(delivery => {
        const option = document.createElement('option');
        option.value = delivery;
        deliveryList.appendChild(option);
    });
}




function filterData() {
    const warehouseValue = document.getElementById('warehouseSelector').value;

    const deliveryValue = document.getElementById('deliverySelector').value;

    const etaStartDateValue = document.getElementById('etaStartDatePicker').value;
    const etaEndDateValue = document.getElementById('etaEndDatePicker').value;

    const unloadChecked = document.getElementById('operationTypeUnload').checked;
    const directChecked = document.getElementById('operationTypeDirect').checked;


    let filteredData = globalSheetData;

    // 如果选定了客户，筛选包含该仓号的数据
    if (warehouseValue) {
        console.log(warehouseValue);
        filteredData = filteredData.filter(container => {

            const unloadingPlace = container[`客户`];
            // 确保unloadingPlace是一个字符串并且非空
            if (typeof unloadingPlace === 'string' && unloadingPlace.trim()) {
                // 对比两者去除首尾空格且转为小写后的值
                if (unloadingPlace.trim().toLowerCase().includes(warehouseValue.trim().toLowerCase())) {
                    return true; // 匹配则保留当前container
                }
            }

            return false; // 未匹配则排除当前container
        });
    }

    // 如果选定了送仓地址，筛选包含该仓号的数据
    if (deliveryValue) {
        console.log(deliveryValue);
        filteredData = filteredData.filter(container => {

            const unloadingPlace = container[`送货地`];
            // 确保unloadingPlace是一个字符串并且非空
            if (typeof unloadingPlace === 'string' && unloadingPlace.trim()) {
                // 对比两者去除首尾空格且转为小写后的值
                if (unloadingPlace.trim().toLowerCase().includes(deliveryValue.trim().toLowerCase())) {
                    return true; // 匹配则保留当前container
                }
            }

            return false; // 未匹配则排除当前container
        });
    }

    // 筛选操作类型（拆柜/直送）
    if (unloadChecked || directChecked) {
        filteredData = filteredData.filter(container => {
            // 只保留拆柜或直送的数据
            const operationType = container.操作方式; // 假设操作方式字段包含拆柜或直送信息
            if (unloadChecked && operationType.includes("拆柜")) {
                return true; // 保留拆柜的数据
            }
            if (directChecked && operationType.includes("直送")) {
                return true; // 保留直送的数据
            }
            return false; // 其他情况排除
        });
    }

    // 如果选定了eta，筛选从今天到所选日期前一天的数据
    if (etaEndDateValue || etaStartDateValue) {

        const selectedStartDate = new Date(etaStartDateValue);

        const selectedEndDate = new Date(etaEndDateValue);

        console.log(`date: ${selectedStartDate} and ${selectedEndDate}`);


        filteredData = filteredData.filter(container => {
            const etaDate = new Date(container.eta.substr(0, 10));
            // 确保eta在今天和所选日期之间
            return etaDate >= selectedStartDate && etaDate < selectedEndDate;
        });

        // 根据eta排序，最近的日期在前
        filteredData.sort((a, b) => new Date(a.eta.substr(0, 10)) - new Date(b.eta.substr(0, 10)));
    }

    displayData(filteredData); // 更新表格显示
}


