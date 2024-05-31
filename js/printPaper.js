let globalSheetData = [];
let filteredData = [];
let currentLocation = 'OAK';
document.addEventListener('DOMContentLoaded', function () {
    // 初始化页面，显示所有数据
    fetchGoogleSheetData(oakUrl);

    // 搜索框输入事件监听器
    document.getElementById('searchInput').addEventListener('input', searchData);
});


// 获取按钮
const oakButton = document.getElementById('loadOakData');
const laButton = document.getElementById('loadLaData');
const airButton = document.getElementById('loadAirData');

// 为OAK按钮添加事件监听器
oakButton.addEventListener('click', function () {
    toggleActiveState(oakButton, laButton, airButton, '奥克兰拆柜信息'); // 切换按钮的激活状态
    currentLocation = 'OAK'
    fetchGoogleSheetData(oakUrl); // 加载OAK地点的数据
    console.log(currentLocation);
});

// 为LA按钮添加事件监听器
laButton.addEventListener('click', function () {
    toggleActiveState(laButton, oakButton, airButton, '洛杉矶拆柜信息(red: 240; yellow: 230; black: 220)'); // 切换按钮的激活状态
    currentLocation = 'LA'
    fetchGoogleSheetData(laUrl); // 加载LA地点的数据
    console.log(currentLocation);
});

// 为空运按钮添加事件监听器
airButton.addEventListener('click', function () {
    toggleActiveState(airButton, oakButton, laButton, '空运货信息'); // 切换按钮的激活状态
    currentLocation = 'Air'
    fetchGoogleSheetData(airUrl); // 加载空运的数据
    console.log(currentLocation);
});

//从google_sheet获取数据
const oakUrl = 'https://script.google.com/macros/s/AKfycbyrAdT_SkCI7o6DCKrwzRf7asPUpjMbAzso8lYZvgTpYbwsJgoHdXRLsblMMmG4CU4/exec'; // 替换为你的Apps Script Web应用URL
const laUrl = 'https://script.google.com/macros/s/AKfycbzQPKNZx1JcbhfBYlTKiBaI49s1KJAk3007KJPbQV7JjVUsVOijPqzCWMCn5HxIthVJ/exec'
const airUrl = 'https://script.google.com/macros/s/AKfycbyFV1Z0TLeJvYxoy_-Ef1J06QCZ__Eebcx-_gzBIFq9rB79f4xbM14OrLM6ZQss8Dms1A/exec'


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

    if (currentLocation === 'Air') {
        console.log(data);
        filteredData = data.filter(airwaybill => airwaybill.airwaybill);
        console.log(filteredData);
        data.filter(airwaybill => airwaybill.airwaybill)
            .forEach((airwaybill, index) => {
                var row = document.createElement('tr');
                row.innerHTML = `
                                <th style="vertical-align: middle;" scope="row">${index}</th>
                                <td id="container-${index}" style="vertical-align: middle;">${airwaybill.airwaybill}</td>
                                <td style="vertical-align: middle;">${airwaybill.客户}</td>
                                <td style="vertical-align: middle;">${airwaybill.到仓日期.substr(0, 10)}</td>
                                <td style="vertical-align: middle;">
                                    <button class="btn btn-primary" data-bs-toggle="collapse" data-bs-target="#collapseDetails_${index}" aria-expanded="false" aria-controls="collapseDetails_${index}">Detail</button>
                                </td>
                                <td>
                                    <button class="btn btn-warning" data-index="${index}" onclick="formatContainerData(this)">Print</button>
                                </td>`;

                containerInfoBody.appendChild(row);
                // 折叠内容的构建
                let validUnloadingPlacesCount = 0;
                var detailsRow = document.createElement('tr');
                var collapseDetailContent = `
                <td colspan="4" class="p-0">
                    <div class="collapse"  id="collapseDetails_${index}">
                        <div class="card card-body bg-dark-subtle">`;

                // 遍历所有可能的卸货地和对应的板数或#
                for (let i = 0; i < 25; i++) {
                    let unloadingPlace = airwaybill[`送货地址${i + 1}`]; // 当前卸货地
                    let boardNumber; // 用于存储当前卸货地的板数或#

                    // 卸货地0使用"板数"，卸货地1使用"板数1"
                    if (i === 0) {
                        boardNumber = airwaybill["板数"] || '';
                    } else { // 卸货地3及之后使用 "#1", "#2", ...
                        boardNumber = airwaybill[`板数${i}`] || '';
                    }


                    // 如果当前卸货地存在，则添加对应的详细内容
                    if (unloadingPlace) {
                        validUnloadingPlacesCount++;
                        collapseDetailContent +=
                            `<div class="detail-row">
                            <p class="mb-2 d-flex align-items-center">
                                <span class="me-3">${unloadingPlace}</span>
                                <span class="me-3">${boardNumber}板</span>
                                <input type="number" class="form-control form-control-sm mx-2 boardnumber-input" style="width: 80px;" data-container="${airwaybill.airwaybill}" data-boardnumber-index="${i}" placeholder="${boardNumber}" />
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

                // 使用之前创建的唯一ID来设置样式
                let containerElement = document.getElementById(`container-${index}`);
                if (validUnloadingPlacesCount <= 10) {
                    containerElement.style.color = 'black';  // 1-10个仓库，黑色
                } else if (validUnloadingPlacesCount <= 14) {
                    containerElement.style.color = '#ffc107'; // 11-14个仓库，黄色
                } else {
                    containerElement.style.color = '#8f2929';    // 17个以上，红色
                }
            });
    }

    else {
        filteredData = data.filter(container => container.container);
        console.log(filteredData);
        data.filter(container => container.container)
            .forEach((container, index) => {
                var row = document.createElement('tr');
                row.innerHTML = `
                                <th style="vertical-align: middle;" scope="row">${index}</th>
                                <td id="container-${index}" style="vertical-align: middle;">${container.container}</td>
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
                let validUnloadingPlacesCount = 0;
                var detailsRow = document.createElement('tr');
                var collapseDetailContent = `
                <td colspan="4" class="p-0">
                    <div class="collapse"  id="collapseDetails_${index}">
                        <div class="card card-body bg-dark-subtle">`;

                // 遍历所有可能的卸货地和对应的板数或#
                for (let i = 0; i < 25; i++) {
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
                        validUnloadingPlacesCount++;
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

                // 使用之前创建的唯一ID来设置样式
                let containerElement = document.getElementById(`container-${index}`);
                if (validUnloadingPlacesCount <= 10) {
                    containerElement.style.color = 'black';  // 1-10个仓库，黑色
                } else if (validUnloadingPlacesCount <= 14) {
                    containerElement.style.color = '#ffc107'; // 11-14个仓库，黄色
                } else {
                    containerElement.style.color = '#8f2929';    // 17个以上，红色
                }
            });
    }


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
function toggleActiveState(selectedButton, otherButton1, otherButton2, titleText) {
    // 切换按钮的激活状态
    selectedButton.classList.remove('btn-outline-primary');
    selectedButton.classList.add('btn-primary');
    otherButton1.classList.add('btn-outline-primary');
    otherButton1.classList.remove('btn-primary');
    otherButton2.classList.add('btn-outline-primary');
    otherButton2.classList.remove('btn-primary');

    // 更新标题
    const titleElement = document.getElementById('datafromLocation');
    titleElement.textContent = titleText;
}


const savingDataUrl = 'https://script.google.com/macros/s/AKfycbxcVB4d8PA184Loz7-9UMZ4AS9KtSKpvrJ5tqZlFD7fdUf5Uel33vnBtHUN63YNIc8r/exec';
const savingLADataUrl = 'https://script.google.com/macros/s/AKfycbyqLavRz7ieA5mvfXNz660GYQ-G92dttVjCu4-X-eG33U8dQRhoNYnXXW70-N058scM/exec'
let formatData = {};
function formatContainerData(button) {
    const index = button.getAttribute('data-index')
    const container = filteredData[index];
    console.log(container);
    let warehouses = [];
    let palletNumbers = [];
    let palletHeights = [];
    let destinations = [];


    const specialWarehouses = [
        "SCK1",
        "SCK4",
        "SMF3",
        "SMF6",
        "LAS1"
    ];

    const LAWarehouses = [
        "GYR2",
        "GYR3",
        "KRB1",
        "KRB4",
        "KRB7",
        "LAS1",
        "LAS6",
        "LAX9",
        "LAX2",
        "LGB4",
        "LGB6",
        "LGB8",
        "LGB9",
        "ONT2",
        "ONT6",
        "ONT8",
        "ONT9",
        "PHX5",
        "PHX7",
        "QXY9",
        "SBD1",
        "SBD2",
        "SBD3",
        "SNA4",
        "VGT2",
        "XLX7",
        "RNO4",
        "USFU",
    ];

    const EastWarehouses = [
        "AVP1",
        "AVP3",
        "ALB1",
        "ACY2",
        "ABE3",
        "ABE4",
        "ABE4",
        "ABE8",
        "ATL8",
        "BWI4",
        "CLT2",
        "CLT3",
        "DCA6",
        "GSP1",
        "GSO1",
        "HGR2",
        "JAX3",
        "KRB2",
        "MDT1",
        "MCO2",
        "MGE1",
        "MGE3",
        "MGE5",
        "MGE7",
        "PIT2",
        "PHL5",
        "PHL6",
        "PHL7",
        "RIC1",
        "XLX1",
        "SWF1",
        "SAV3",
        "TTN2",
        "TPA2",
        "TPA3",
        "TPA6",
        "TEB3",
        "TBE4",
        "TEB6",
        "TEB9",
        "SWF2",
        "ORF2",
        "TEB4",
        "RMN3",
        "ATL1",
        "GS01",
        "RDU2",
        "XLX6",
        "BOS7",
        "ILG1",
    ];

    const BayAreaWarehouses = [
        "MCE1",
        "OAK3",
        "SCK1",
        "SCK3",
        "SCK4",
        "SMF3",
        "SMF6",
        "FAT2",
        "SJC7",
        "SMF7",
    ];

    const WendyWareHouses = [
        "BNA2",
        "BFI3",
        "CHA2",
        "CMH2",
        "CMH3",
        "DET1",
        "DET2",
        "DEN2",
        "DFW6",
        "FTW1",
        "FTW3",
        "FTW5",
        "FTW9",
        "FWA4",
        "GEG2",
        "HOU3",
        "HOU8",
        "IGQ2",
        "ICT2",
        "IAH3",
        "IND9",
        "FOE1",
        "JVL1",
        "LFT1",
        "MEM1",
        "MQJ1",
        "MDW2",
        "MKC4",
        "ORD2",
        "OKC2",
        "PDX6",
        "SAT1",
        "SAT4",
        "SLC2",
        "SLC3",
        "STL3",
        "STL4",
        "SLT4",
        "SLT6",
        "LIT2",
        "HSV1",
        "MQJ2",
        "DFW2n",
        "RFD2",
        "RFD1",
    ];

    // 尝试打开或复用Google Sheets文档窗口
    const sheetWindowName = 'GoogleSheetDataWindow';
    window.open('https://docs.google.com/spreadsheets/d/1p-lPEFgBeEfAOIpPDEcfnsu2MWj-x1ZCDkJD5_J6bxo/edit#gid=789142677', sheetWindowName);

    console.log(currentLocation);

    if (currentLocation === 'Air') {
        console.log('空运');
        console.log(container);
        for (let i = 0; i < 25; i++) {
            let unloadingPlace = container[`送货地址${i + 1}`];
            let boardNumber;


            // 卸货地0使用"板数"，卸货地1使用"板数1"
            if (i === 0) {
                boardNumber = container["板数"] || '';
            } else { // 卸货地3及之后使用 "#1", "#2", ...
                boardNumber = container[`板数${i}`] || '';
            }

            if (unloadingPlace) {
                unloadingPlace = unloadingPlace.toString().trim();

                const inputElement = document.querySelector(`input[data-container="${airwaybill.airwaybill}"][data-boardnumber-index="${i}"]`);
                warehouses.push(`${unloadingPlace}`);
                boardNumber = boardNumber ? boardNumber : inputElement.value;
                palletNumbers.push(`${boardNumber}`);
                palletHeights.push(`N/A`);
                destinations.push("N/A");

            }


        }
        console.log(warehouses);
        console.log(palletNumbers);
        console.log(destinations);
        formatData = {
            containerNumber: container.airwaybill,
            clientName: container.客户,
            unloadingDate: container.到仓日期.substr(0, 10),
            warehouses: warehouses,
            palletNumbers: palletNumbers,
            palletHeights: palletHeights,
            destinations: destinations
        };
    } else {
        for (let i = 0; i < 25; i++) {
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

                // 先判断仓号是否为东部仓库
                let isEastWarehouse = EastWarehouses.some(eastWarehouse => unloadingPlace.includes(eastWarehouse));
                if (isEastWarehouse) {
                    palletHeights.push(`less than 75''`);
                } else {
                    // 再判断仓号是否为特殊仓库
                    let isSpecialWarehouse = specialWarehouses.some(specialWarehouse => unloadingPlace.includes(specialWarehouse));
                    if (isSpecialWarehouse) {
                        palletHeights.push(`less than 72''`);
                    } else {
                        palletHeights.push(`less than 75''`);
                    }
                }

                // 目的地判断
                let isLA = LAWarehouses.some(warehouse => unloadingPlace.includes(warehouse));
                let isBayArea = BayAreaWarehouses.some(warehouse => unloadingPlace.includes(warehouse));
                let isWendy = WendyWareHouses.some(warehouse => unloadingPlace.includes(warehouse));

                if (isLA) {
                    destinations.push("LA");
                } else if (isBayArea) {
                    destinations.push("湾区");
                } else if (isEastWarehouse) {
                    destinations.push("美东");
                } else if (isWendy) {
                    destinations.push("Wendy");
                } else {
                    destinations.push("N/A");
                }

            }


        }
        console.log(warehouses);
        console.log(palletNumbers);
        console.log(destinations);
        formatData = {
            containerNumber: container.container,
            clientName: container.客户,
            unloadingDate: container.拆柜日期.substr(0, 10),
            warehouses: warehouses,
            palletNumbers: palletNumbers,
            palletHeights: palletHeights,
            destinations: destinations
        };
    }

    console.log(formatData);

    data = formatData;

    sendDataToGoogleSheet();

    for (let i = 0; i < 25; i++) {
        generatePDF(formatData.containerNumber, formatData.warehouses[i], formatData.clientName, formatData.unloadingDate, formatData.palletNumbers[i]);
    }

}

var data = {}

function sendDataToGoogleSheet() {

    console.log(data);
    console.log(currentLocation === ('OAK' || 'Air'));
    console.log(currentLocation === 'LA');
    if (currentLocation === 'OAK' || currentLocation === 'Air') {
        console.log('in oak:' + currentLocation);
        fetch(savingDataUrl, {
            method: 'POST',
            contentType: 'application/json',
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.error('Error:', error));
    } else if (currentLocation === 'LA') {
        console.log('in la:' + currentLocation);
        fetch(savingLADataUrl, {
            method: 'POST',
            contentType: 'application/json',
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.error('Error:', error));
    }

}
