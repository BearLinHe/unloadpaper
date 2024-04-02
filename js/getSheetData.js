let globalSheetData = [];

// 获取按钮
const oakButton = document.getElementById('loadOakData');
const laButton = document.getElementById('loadLaData');
document.addEventListener('DOMContentLoaded', function () {

    // 添加事件监听器
    document.getElementById('warehouseSelector').addEventListener('change', filterData);
    document.getElementById('etaStartDatePicker').addEventListener('change', filterData);
    document.getElementById('etaEndDatePicker').addEventListener('change', filterData);
    document.getElementById('unloadStartDatePicker').addEventListener('change', filterData);
    document.getElementById('unloadEndDatePicker').addEventListener('change', filterData);



    // 初始化页面数据
    fetchGoogleSheetData(oakUrl);

});


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

        console.log(data);
        globalSheetData = data;

        populateWarehouseOptions(globalSheetData);

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
    const filteredData = data.filter(container => container.container);
    console.log(filteredData);
    data.filter(container => container.container)
        .forEach((container, index) => {
            var row = document.createElement('tr');
            row.innerHTML = `
            <th style="vertical-align: middle;" scope="row">${index}</th>
            <td style="vertical-align: middle;">${container.container}</td>
            <td style="vertical-align: middle;">${container.客户}</td>
            <td style="vertical-align: middle;">${container.eta日期.substr(0, 10)}</td>
            <td style="vertical-align: middle;">${container.拆柜日期.substr(0, 10)}</td>
            <td style="vertical-align: middle;">
                <button class="btn btn-primary" data-bs-toggle="collapse" data-bs-target="#collapseDetails_${index}" aria-expanded="true" aria-controls="collapseDetails_${index}">Detail</button>
            </td>`;
            containerInfoBody.appendChild(row);
            // 折叠内容的构建
            var detailsRow = document.createElement('tr');
            var collapseDetailContent = `
            <td colspan="4" class="p-0">
                <div class="collapse show"  id="collapseDetails_${index}">
                    <div class="card card-body bg-dark-subtle">`;

            // 遍历所有可能的卸货地和对应的板数或#
            for (let i = 0; i < 10; i++) {
                let unloadingPlace = container[`卸货地${i}`]; // 当前卸货地
                let boardNumber; // 用于存储当前卸货地的板数或#
                let date;


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

                //
                if (i === 0) {
                    date = container['date'] || '';
                } else {
                    date = container[`date${i}`] || '';
                }


                // 如果当前卸货地存在，则添加对应的详细内容
                if (unloadingPlace) {
                    collapseDetailContent +=
                        `<div class="detail-row">
                            <p class="mb-2 d-flex align-items-center">
                                <span class="me-3">${unloadingPlace}</span>
                                <span class="me-3">${boardNumber}板</span>
                                <span>${date}</span>
                                <input type="number" class="form-control form-control-sm mx-2" style="width: 80px;" data-container="${container.container}" placeholder="${boardNumber}" />
                                <input type="checkbox" class="mx-2" data-container="${container.container}" />
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

//填充仓号的 <datalist>
function populateWarehouseOptions(data) {
    const warehouseOptionsSet = new Set();

    data.forEach(container => {
        for (let i = 0; i < 10; i++) {
            let unloadingPlace = container[`卸货地${i}`];
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





function filterData() {
    const warehouseValue = document.getElementById('warehouseSelector').value;
    const etaStartDateValue = document.getElementById('etaStartDatePicker').value;
    const etaEndDateValue = document.getElementById('etaEndDatePicker').value;
    const unloadStartDateValue = document.getElementById('unloadStartDatePicker').value;
    const unloadEndDateValue = document.getElementById('unloadEndDatePicker').value;
    let filteredData = globalSheetData;

    // 如果选定了仓号，筛选包含该仓号的数据
    if (warehouseValue) {
        console.log(warehouseValue);
        filteredData = filteredData.filter(container => {
            // 遍历卸货地0到卸货地9
            for (let i = 0; i < 10; i++) {
                const unloadingPlace = container[`卸货地${i}`];
                // 确保unloadingPlace是一个字符串并且非空
                if (typeof unloadingPlace === 'string' && unloadingPlace.trim()) {
                    // 对比两者去除首尾空格且转为小写后的值
                    if (unloadingPlace.trim().toLowerCase().includes(warehouseValue.trim().toLowerCase())) {
                        return true; // 匹配则保留当前container
                    }
                }
            }
            return false; // 未匹配则排除当前container
        });
    }

    // 如果选定了ETA日期，筛选从今天到所选日期之间的数据
    if (etaEndDateValue || etaStartDateValue) {

        const selectedStartDate = new Date(etaStartDateValue);

        const selectedEndDate = new Date(etaEndDateValue);

        console.log(`date: ${selectedStartDate} and ${selectedEndDate}`);


        filteredData = filteredData.filter(container => {
            const etaDate = new Date(container.eta日期.substr(0, 10));
            // 确保ETA日期在今天和所选日期之间
            return etaDate >= selectedStartDate && etaDate < selectedEndDate;
        });

        // 根据ETA日期排序，最近的日期在前
        filteredData.sort((a, b) => new Date(a.eta日期.substr(0, 10)) - new Date(b.eta日期.substr(0, 10)));
    }



    // 如果选定了拆柜日期，筛选从今天到所选日期之间的数据
    if (unloadStartDateValue || unloadEndDateValue) {

        const selectedUnloadStartDate = new Date(unloadStartDateValue);

        const selectedUnloadEndDate = new Date(unloadEndDateValue);

        console.log(`date: ${selectedUnloadStartDate} and ${selectedUnloadEndDate}`);


        filteredData = filteredData.filter(container => {
            const unloadDate = new Date(container.拆柜日期.substr(0, 10));
            // 确保ETA日期在今天和所选日期之间
            return unloadDate >= selectedUnloadStartDate && unloadDate < selectedUnloadEndDate;
        });

        // 根据ETA日期排序，最近的日期在前
        filteredData.sort((a, b) => new Date(a.拆柜日期.substr(0, 10)) - new Date(b.拆柜日期.substr(0, 10)));
    }
    displayData(filteredData); // 更新表格显示
}


document.getElementById('calculateButton30').addEventListener('click', function () {
    const selectedContainers = [];
    document.querySelectorAll('.detail-row input[type="checkbox"]:checked').forEach(checkbox => {
        const container = checkbox.getAttribute('data-container');
        const input = checkbox.previousElementSibling; // 假设输入框紧挨着选择框
        const boards = input.value ? input.value : input.placeholder; // 如果用户没有输入，使用placeholder的值
        selectedContainers.push({ container, boards });
    });

    // 执行您的计算逻辑，这里是个示例
    console.log(selectedContainers);
    let groups = allocateContainers(selectedContainers, 30);

    displayResults(groups);
});

document.getElementById('calculateButton28').addEventListener('click', function () {
    const selectedContainers = [];
    document.querySelectorAll('.detail-row input[type="checkbox"]:checked').forEach(checkbox => {
        const container = checkbox.getAttribute('data-container');
        const input = checkbox.previousElementSibling; // 假设输入框紧挨着选择框
        const boards = input.value ? input.value : input.placeholder; // 如果用户没有输入，使用placeholder的值
        selectedContainers.push({ container, boards });
    });

    // 执行您的计算逻辑，这里是个示例
    console.log(selectedContainers);
    let groups = allocateContainers(selectedContainers, 28);

    displayResults(groups);
});


function allocateContainers(selectedContainers, perPallet) {
    let groups = []; // 存储每组的板数
    let containerSplits = new Map(); // 使用Map记录每个容器的拆分次数

    // 初始化容器拆分次数
    selectedContainers.forEach(containerInfo => {
        containerSplits.set(containerInfo.container, 0);
    });

    // 尝试为每个容器分配板数
    selectedContainers.forEach(containerInfo => {
        let boards = containerInfo.boards;
        const container = containerInfo.container;

        while (boards > 0) {
            let allocated = false;

            // 优先填充未满的组
            for (let group of groups) {
                let spaceLeft = perPallet - group.total;
                if (spaceLeft > 0 && containerSplits.get(container) < 3) {
                    let boardsToAdd = Math.min(boards, spaceLeft);
                    group.total += boardsToAdd;
                    group.details.push({ container, boards: boardsToAdd });
                    boards -= boardsToAdd;
                    allocated = true;
                    containerSplits.set(container, containerSplits.get(container) + (boardsToAdd > 0 ? 1 : 0));
                    break;
                }
            }

            // 如果当前容器未能分配到任何现有组，创建新的组
            if (!allocated) {
                let boardsToAdd = Math.min(boards, perPallet);
                groups.push({ total: boardsToAdd, details: [{ container, boards: boardsToAdd }] });
                boards -= boardsToAdd;
                containerSplits.set(container, containerSplits.get(container) + (boardsToAdd > 0 ? 1 : 0));
            }
        }
    });

    return groups;
}


function displayResults(groups) {
    const resultsElement = document.getElementById('results');
    if (groups.length === 0) {
        resultsElement.innerHTML = `<p>没有足够的板数来形成任何组。</p>`;
        return;
    }

    // 创建结果的HTML内容
    let htmlContent = `<p>总共有 ${groups.length} 组，按照要求分配如下：</p>`;
    groups.forEach((group, index) => {
        htmlContent += `<div><strong>组 ${index + 1} (总计 ${group.total} 板):</strong><ul>`;
        group.details.forEach(detail => {
            htmlContent += `<li>柜号 ${detail.container}：${detail.boards} 板</li>`;
        });
        htmlContent += `</ul></div>`;
    });

    resultsElement.innerHTML = htmlContent;
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
