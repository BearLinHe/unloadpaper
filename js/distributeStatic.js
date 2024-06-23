let globalSheetData = [];


document.addEventListener('DOMContentLoaded', function () {

    document.getElementById('warehouseSelector').addEventListener('change', filterData);
    document.getElementById('startDatePicker').addEventListener('change', filterData);
    document.getElementById('endDatePicker').addEventListener('change', filterData);

    // 初始化页面数据
    fetchGoogleSheetData(distributeUrl);

});


//从google_sheet获取数据
const distributeUrl = 'https://script.google.com/macros/s/AKfycbxclbQ8fieJzzdsui7De4cJsmNFe9q4wjXrSZ-yg0ym1KHH8AG5kP1VpXdG6_eWn4f83Q/exec';

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

        // populateWarehouseOptions(globalSheetData);

        displayData(globalSheetData);
    } catch (error) {
        console.error('Error fetching data:', error);
        // 发生错误时也要隐藏加载指示器
        document.getElementById('loadingIndicator').style.display = 'none';

    }
}

// 显示数据
function displayData(data) {
    const loadingCount = document.getElementById('loadingCount');
    let count = 0;
    var containerInfoBody = document.getElementById('containerInfoBody');
    containerInfoBody.innerHTML = ''; // 清空表格内容
    const filteredData = data.filter(data => data.柜号);
    console.log(filteredData);
    filteredData.reverse().
        // slice(0, 800).
        forEach((data, index) => {
            count++;
            var row = document.createElement('tr');
            row.innerHTML = `
            <th style="vertical-align: middle;" scope="row">${index+1}</th>
            <td style="vertical-align: middle;">${data.日期.substr(0,10)}</td>
            <td style="vertical-align: middle;">${data.备注}</td>
            <td style="vertical-align: middle;">${data.柜号}</td>
            <td style="vertical-align: middle;">
                <button class="btn btn-primary" data-bs-toggle="collapse" data-bs-target="#collapseDetails_${index}" aria-expanded="true" aria-controls="collapseDetails_${index}">Detail</button>
            </td>`;
            containerInfoBody.appendChild(row);
            // 折叠内容的构建
            var detailsRow = document.createElement('tr');
            var collapseDetailContent = `
            <td colspan="4" class="p-0">
                <div class="collapse"  id="collapseDetails_${index}">
                    <div class="card card-body bg-dark-subtle">`;

            collapseDetailContent +=
                `<div class="detail-row">
                            <p class="mb-2 d-flex align-items-center">
                                <span class="me-3">${data.司机安排}</span>
                                <span class="me-3">${data.送货地址}</span>
                            </p>
                        </div>`;


            collapseDetailContent += `
                    </div>
                </div>
            </td>`;
            detailsRow.innerHTML = collapseDetailContent;
            containerInfoBody.appendChild(detailsRow);
        });
    loadingCount.textContent = count;
}




function filterData() {
    const warehouseValue = document.getElementById('warehouseSelector').value;
    const startDateValue = document.getElementById('startDatePicker').value;
    const endDateValue = document.getElementById('endDatePicker').value;
    let filteredData = globalSheetData;

    // 如果选定了仓号，筛选包含该仓号的数据
    if (warehouseValue) {
        console.log(warehouseValue);
        filteredData = filteredData.filter(data => {
            const destination = data[`送货地址`];
            if (typeof destination === 'string' && destination.trim()) {
                // 对比两者去除首尾空格且转为小写后的值
                if (destination.trim().toLowerCase().includes(warehouseValue.trim().toLowerCase())) {
                    return true; // 匹配则保留当前data
                }
            }
            return false; // 未匹配则排除当前data
        });
    }

    // 如果选定了ETA日期，筛选从今天到所选日期之间的数据
    if (endDateValue || startDateValue) {

        const selectedStartDate = new Date(startDateValue);

        const selectedEndDate = new Date(endDateValue);

        console.log(`date: ${selectedStartDate} and ${selectedEndDate}`);


        filteredData = filteredData.filter(data => {
            const dateString = data[`日期`];
            if (typeof dateString === 'string') {
                const date = new Date(dateString.substr(0, 10));
                // 确保ETA日期在今天和所选日期之间
                return date >= selectedStartDate && date <= selectedEndDate;
            }
            
            
        });

        // 根据ETA日期排序，最近的日期在前
        filteredData.sort((a, b) => new Date(a.日期.substr(0, 10)) - new Date(b.日期.substr(0, 10)));
    }

    displayData(filteredData); // 更新表格显示
}


