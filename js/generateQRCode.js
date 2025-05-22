// QR Code generation version of printPaper.js, OAK only
let globalSheetData = [];
let filteredData = [];
let currentLocation = 'OAK';

const oakUrl = 'https://script.google.com/macros/s/AKfycby_DWnMWhxBglojgyl0wZdsMBgojjxQgJFp_SlX3ew3nELUlPhHVE_mShfy4MXLIWskeA/exec';

document.addEventListener('DOMContentLoaded', function () {
    fetchGoogleSheetData(oakUrl);
    document.getElementById('searchInput').addEventListener('input', searchData);
});

async function fetchGoogleSheetData(url) {
    try {
        document.getElementById('loadingIndicator').style.display = 'block';
        const response = await fetch(url);
        const { data } = await response.json();
        document.getElementById('loadingIndicator').style.display = 'none';
        globalSheetData = data;
        console.log(globalSheetData);
        displayData(globalSheetData);
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('loadingIndicator').style.display = 'none';
    }
}

function displayData(data) {
    const containerInfoBody = document.getElementById('containerInfoBody');
    containerInfoBody.innerHTML = '';

    filteredData = data.filter(container => container.container);

    filteredData.forEach((container, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <th scope="row" style="vertical-align: middle;">${index}</th>
            <td id="container-${index}" style="vertical-align: middle;">${container.container}</td>
            <td style="vertical-align: middle;">${container.客户}</td>
            <td style="vertical-align: middle;">${String(container.拆柜日期 || '').substring(0, 10)}</td>
            <td style="vertical-align: middle;">
                <button class="btn btn-primary" data-bs-toggle="collapse" data-bs-target="#collapseDetails_${index}">Detail</button>
            </td>
        `;

        const detailsRow = document.createElement('tr');
        let collapseDetailContent = `
            <td colspan="5" class="p-0">
                <div class="collapse" id="collapseDetails_${index}">
                    <div class="card card-body bg-light">
        `;

        let validUnloadingPlacesCount = 0;

        for (let i = 0; i < 25; i++) {
            let unloadingPlace = container[`卸货地${i}`];
            let boardNumber = '';
            if (i === 0) boardNumber = container['板数'] || '';
            else if (i === 1) boardNumber = container['板数1'] || '';
            else if (i === 2) boardNumber = container['#'] || '';
            else boardNumber = container[`#${i - 2}`] || '';

            if (unloadingPlace) {
                validUnloadingPlacesCount++;
                collapseDetailContent += `
                    <div class="detail-row d-flex align-items-center mb-2">
                        <span class="me-3">${unloadingPlace}</span>
                        <span class="me-3">${boardNumber}板</span>
                        <button class="btn btn-sm btn-success" onclick="generateQRCodes('${container.container}', '${unloadingPlace}', '${String(container.拆柜日期 || '').substring(0, 10)}', ${i}, ${parseInt(boardNumber) || 0})">打印二维码</button>
                    </div>
                `;
            }
        }

        collapseDetailContent += '</div></div></td>';
        detailsRow.innerHTML = collapseDetailContent;

        containerInfoBody.appendChild(row);
        containerInfoBody.appendChild(detailsRow);

        const containerElement = document.getElementById(`container-${index}`);
        if (validUnloadingPlacesCount <= 10) containerElement.style.color = 'black';
        else if (validUnloadingPlacesCount <= 14) containerElement.style.color = '#ffc107';
        else containerElement.style.color = '#8f2929';
    });
}

function searchData() {
    const keyword = document.getElementById('searchInput').value.trim();
    filteredData = globalSheetData.filter(item => {
        const container = `${item.container}`;
        return keyword === '' || container.endsWith(keyword);
    });
    displayData(filteredData);
}


// 查找数据 根据拆柜日期筛选
function filterByDate() {
    const selectedDate = document.getElementById('dateFilter').value;

    filteredData = globalSheetData.filter(item => {
        const itemDate = String(item.拆柜日期 || '').substring(0, 10);
        return selectedDate === '' || itemDate === selectedDate;
    });
    
    displayData(filteredData); // 显示筛选结果
}


async function generateQRCodes(container, warehouse, date, index, boardCount) {
    const folderName = `${container}_${warehouse}`;
    const zip = new JSZip();

    for (let j = 0; j < boardCount; j++) {
        const uid = `${folderName}_${index + 1}_${j + 1}`;
        const qrData = { uid, container, warehouse, date };

        const canvas = document.createElement('canvas');
        await QRCode.toCanvas(canvas, JSON.stringify(qrData));

        const dataUrl = canvas.toDataURL('image/png');
        const base64Data = dataUrl.split(',')[1]; // 去掉 data:image 部分

        zip.file(`${uid}.png`, base64Data, { base64: true });
    }

    // 生成 ZIP 并触发下载
    zip.generateAsync({ type: 'blob' }).then(function (content) {
        const zipName = `${folderName}.zip`;
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = zipName;
        link.click();
    });
}
