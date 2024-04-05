let globalSheetData = [];
let filteredData = [];
document.addEventListener('DOMContentLoaded', function () {
    // 初始化页面，显示所有数据
    fetchGoogleSheetData(oakUrl);

    // 搜索框输入事件监听器
    document.getElementById('searchInput').addEventListener('input', searchData);
});


// 获取按钮
const oakButton = document.getElementById('loadOakData');
const laButton = document.getElementById('loadLaData');

// 为OAK按钮添加事件监听器
oakButton.addEventListener('click', function () {
    toggleActiveState(oakButton, laButton, '奥克兰拆柜信息'); // 切换按钮的激活状态
    fetchGoogleSheetData(oakUrl); // 加载OAK地点的数据
});

// 为LA按钮添加事件监听器
laButton.addEventListener('click', function () {
    toggleActiveState(laButton, oakButton, '洛杉矶拆柜信息'); // 切换按钮的激活状态
    fetchGoogleSheetData(laUrl); // 加载LA地点的数据
});

//从google_sheet获取数据
const oakUrl = 'https://script.google.com/macros/s/AKfycbyrAdT_SkCI7o6DCKrwzRf7asPUpjMbAzso8lYZvgTpYbwsJgoHdXRLsblMMmG4CU4/exec'; // 替换为你的Apps Script Web应用URL
const laUrl = 'https://script.google.com/macros/s/AKfycbzQPKNZx1JcbhfBYlTKiBaI49s1KJAk3007KJPbQV7JjVUsVOijPqzCWMCn5HxIthVJ/exec'

async function fetchGoogleSheetData(url) {
    try {
        // 显示加载指示器
        document.getElementById('loadingIndicator').style.display = 'block';

        const response = await fetch(url);
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
    filteredData = data.filter(container => container.container);
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
            </td>
            <td>
                <button class="btn btn-warning" data-index="${index}" onclick="formatContainerData(this)">Print</button>
            </td>`;



            containerInfoBody.appendChild(row);
            // 折叠内容的构建
            var detailsRow = document.createElement('tr');
            var collapseDetailContent = `
            <td colspan="4" class="p-0">
                <div class="collapse"  id="collapseDetails_${index}">
                    <div class="card card-body bg-dark-subtle">`;

            // 遍历所有可能的卸货地和对应的板数或#
            for (let i = 0; i < 16; i++) {
                let unloadingPlace = container[`卸货地${i}`]; // 当前卸货地
                let boardNumber; // 用于存储当前卸货地的板数或#

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
                            <p class="mb-2 d-flex align-items-center">
                                <span class="me-3">${unloadingPlace}</span>
                                <span class="me-3">${boardNumber}板</span>
                                <input type="number" class="form-control form-control-sm mx-2 boardnumber-input" style="width: 80px;" data-container="${container.container}" data-boardnumber-index="${i}" placeholder="${boardNumber}" />
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
    filteredData = globalSheetData.filter(item => {
        const container = `${item.container}`; // 使用模板字符串确保container是字符串
        return keyword === '' || container.endsWith(keyword);
    });

    displayData(filteredData); // 显示搜索结果
}
// 查找数据 根据拆柜日期筛选
function filterByDate() {
    const selectedDate = document.getElementById('dateFilter').value;
    // 根据选定的日期过滤数据
    filteredData = globalSheetData.filter(item => {
        const itemDate = item.拆柜日期.substr(0, 10); // 假设拆柜日期格式为"YYYY-MM-DD"
        return selectedDate === '' || itemDate === selectedDate;
    });

    displayData(filteredData); // 显示筛选结果
}


// 定义一个函数，用于切换按钮的激活状态并更新标题
function toggleActiveState(selectedButton, otherButton, titleText) {
    // 切换按钮的激活状态
    selectedButton.classList.remove('btn-outline-primary');
    selectedButton.classList.add('btn-primary');
    otherButton.classList.add('btn-outline-primary');
    otherButton.classList.remove('btn-primary');

    // 更新标题
    const titleElement = document.getElementById('datafromLocation');
    titleElement.textContent = titleText;
}


const savingDataUrl = 'https://script.google.com/macros/s/AKfycbxcVB4d8PA184Loz7-9UMZ4AS9KtSKpvrJ5tqZlFD7fdUf5Uel33vnBtHUN63YNIc8r/exec';

function formatContainerData(button) {
    const index = button.getAttribute('data-index')
    const container = filteredData[index];
    console.log(container);
    let warehouses = [];
    let palletNumbers = [];
    let palletHeights = [];

    const specialWarehouses = ["SCK1", "SCK4", "SMF3", "SMF6", "LAS1"];

    for (let i = 0; i < 16; i++) {
        let unloadingPlace = container[`卸货地${i}`];
        let boardNumber;


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

        if (unloadingPlace) {
            unloadingPlace = unloadingPlace.toString().trim();

            const inputElement = document.querySelector(`input[data-container="${container.container}"][data-boardnumber-index="${i}"]`);
            warehouses.push(`${unloadingPlace}`);
            boardNumber = boardNumber ? boardNumber : inputElement.value;
            palletNumbers.push(`${boardNumber}`);

            // 判断仓号是否包含特定字符串
            let isSpecialWarehouse = specialWarehouses.some(specialWarehouse => unloadingPlace.includes(specialWarehouse));
            palletHeights.push(isSpecialWarehouse ? `less than 72''` : `less than 75''`);
        }


    }
    console.log(warehouses);
    console.log(palletNumbers);

    const formatData = {
        containerNumber: container.container,
        clientName: container.客户,
        unloadingDate: container.拆柜日期.substr(0, 10),
        warehouses: warehouses,
        palletNumbers: palletNumbers,
        palletHeights: palletHeights
    };


    console.log(formatData);

    data = formatData;

    sendDataToGoogleSheet();

    for (let i = 0; i < 16; i++) {
        generatePDF(formatData.containerNumber, formatData.warehouses[i], formatData.clientName, formatData.unloadingDate, formatData.palletNumbers[i]);
    }

}

var data = {}

function sendDataToGoogleSheet() {

    console.log(data);
    fetch(savingDataUrl, {
        method: 'POST',
        contentType: 'application/json',
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));
}
