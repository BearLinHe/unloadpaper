let globalSheetData = [];
document.addEventListener('DOMContentLoaded', function () {
    // 初始化页面，显示所有数据
    fetchGoogleSheetData();

    // 搜索框输入事件监听器
    document.getElementById('searchInput').addEventListener('input', searchData);
});

//从google_sheet获取数据
const oakpointUrl = 'https://script.google.com/macros/s/AKfycbyrAdT_SkCI7o6DCKrwzRf7asPUpjMbAzso8lYZvgTpYbwsJgoHdXRLsblMMmG4CU4/exec'; // 替换为你的Apps Script Web应用URL
const laUrl = 'https://script.google.com/macros/s/AKfycbzQPKNZx1JcbhfBYlTKiBaI49s1KJAk3007KJPbQV7JjVUsVOijPqzCWMCn5HxIthVJ/exec'

async function fetchGoogleSheetData() {
    try {
        // 显示加载指示器
        document.getElementById('loadingIndicator').style.display = 'block';

        const response = await fetch(oakpointUrl);
        const { data } = await response.json(); // 从Google Sheets获取数据


        // 隐藏加载指示器
        document.getElementById('loadingIndicator').style.display = 'none';

        globalSheetData = data;
        console.log(globalSheetData);
        displayData(globalSheetData); // 使用整合后的数据调用displayData函数进行展示
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
    const filteredData = data.filter(container => container.container);
    console.log(filteredData);
    data.filter(container => container.container)
        .forEach((container, index) => {
            var row = document.createElement('tr');
            row.innerHTML = `
            <th style="vertical-align: middle;" scope="row">${index}</th>
            <td style="vertical-align: middle;">${container.container}</td>
            <td style="vertical-align: middle;">${container.客户}</td>
            <td style="vertical-align: middle;">${container.拆柜日期.substr(0, 10)}</td>
            <td style="vertical-align: middle;">
                <button class="btn btn-primary" data-bs-toggle="collapse" data-bs-target="#collapseDetails_${index}" aria-expanded="false" aria-controls="collapseDetails_${index}">Detail</button>
            </td>`;
            containerInfoBody.appendChild(row);
            // 折叠内容的构建
            var detailsRow = document.createElement('tr');
            var collapseDetailContent = `
            <td colspan="4" class="p-0">
                <div class="collapse"  id="collapseDetails_${index}">
                    <div class="card card-body bg-dark-subtle">`;

            // 遍历所有可能的卸货地和对应的板数或#
            for (let i = 0; i < 10; i++) {
                let unloadingPlace = container[`卸货地${i}`]; // 当前卸货地
                let boardNumber; // 用于存储当前卸货地的板数或#
                let position = container[`position${i}`];

                // 卸货地0使用"板数"，卸货地1使用"板数1"
                if (i === 0) {
                    boardNumber = container["板数"] || '';
                } else if (i === 1) {
                    boardNumber = container["板数1"] || '';
                } else if (i === 2) {
                    boardNumber = container["#"] || '';
                } else { // 卸货地3及之后使用 "#1", "#2", ...
                    boardNumber = container[`#${i - 2}`] || '';
                }

            
                // 如果当前卸货地存在，则添加对应的详细内容
                if (unloadingPlace) {
                    collapseDetailContent +=
                        `<div class="detail-row">
                        <p class="mb-2">
                            <span class="me-3">${unloadingPlace}</span>
                            <span class="me-3">${boardNumber}板</span> 
                        </p>
                    </div>`;

                }
            }

            collapseDetailContent += `
                    </div>
                </div>
            </td>`;

            detailsRow.innerHTML = collapseDetailContent;
            containerInfoBody.appendChild(detailsRow);
        });
}


// 查找数据 根据柜号查找  支持只输入柜号尾号
function searchData() {
    var keyword = document.getElementById('searchInput').value.trim(); // 获取搜索关键词
    // 根据关键词过滤数据
    const filteredData = globalSheetData.filter(item => {
        const container = `${item.container}`; // 使用模板字符串确保container是字符串
        return keyword === '' || container.endsWith(keyword);
    });

    displayData(filteredData); // 显示搜索结果
}
// 查找数据 根据拆柜日期筛选
function filterByDate() {
    const selectedDate = document.getElementById('dateFilter').value;
    // 根据选定的日期过滤数据
    const filteredData = globalSheetData.filter(item => {
        const itemDate = item.拆柜日期.substr(0, 10); // 假设拆柜日期格式为"YYYY-MM-DD"
        return selectedDate === '' || itemDate === selectedDate;
    });

    displayData(filteredData); // 显示筛选结果
}



