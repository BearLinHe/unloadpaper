var shipmentsData = [];

function showModal() {
    document.getElementById('editModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('editModal').style.display = 'none';
}

function processInputs() {
    shipmentsData = [];
    
    const FBA = document.getElementById('FBA').value.split('\n');
    const palletCounts = document.getElementById('palletCount').value.split('\n');
    const cartonCounts = document.getElementById('cartonCount').value.split('\n');
    const unitCounts = document.getElementById('unitCount').value.split('\n');
    const poLists = document.getElementById('poList').value.split('\n');

   
    FBA.forEach((refNumber, index) => {
        shipmentsData.push({
            id: index + 1,
            ARN: '',
            refNumber: refNumber.trim(),
            bolNumber: '',
            vendorName: '',
            palletCount: parseInt(palletCounts[index]),
            cartonCount: parseInt(cartonCounts[index]),
            unitCount: parseInt(unitCounts[index]),
            poList: poLists[index].trim()
        });
    });

    console.log(shipmentsData);
    populateTable()
    closeModal();
    // 提交后清空所有输入
    document.getElementById('FBA').value = '';
    document.getElementById('palletCount').value = '';
    document.getElementById('cartonCount').value = '';
    document.getElementById('unitCount').value = '';
    document.getElementById('poList').value = '';
}


// // 假设这是你从服务器或其他来源获取的数据数组
// var shipmentsData = [
//     { id: 1, ARN: '', refNumber: 'FBA17QSTXV8A', bolNumber: '', vendorName: '', palletCount: 28, cartonCount: 100, unitCount: 454, poList: '1H55XG8C' },
//     { id: 2, ARN: '', refNumber: 'FBA17QSXJ5LB', bolNumber: '', vendorName: '', palletCount: 0, cartonCount: 100, unitCount: 699, poList: '6CEZ2IYC' },
//     { id: 3, ARN: '', refNumber: 'FBA17QSXxcvw', bolNumber: '', vendorName: '', palletCount: 0, cartonCount: 100, unitCount: 699, poList: '6CEZ2IYC' },
//     { id: 4, ARN: '', refNumber: 'FBA17QSXxcvw', bolNumber: '', vendorName: '', palletCount: 0, cartonCount: 100, unitCount: 699, poList: '6CEZ2IYC' },

    
//     // 更多数据...
// ];

function populateTable() {
    var tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = ''; // 清空表格体，为添加新行做准备

    shipmentsData.forEach(function (item) {
        var row = document.createElement('tr');
        row.innerHTML = `
            <td class="a-text-center">${item.id}</td>
            <td class="a-text-center"><span>${item.ARN}</span></td>
            <td class="a-text-center"><span>${item.refNumber}</span></td>
            <td class="a-text-center"><span>${item.bolNumber}</span></td>
            <td class="a-text-center"><span>${item.vendorName}</span></td>
            <td class="a-text-center"><span>${item.palletCount}</span></td>
            <td class="a-text-center"><span>${item.cartonCount}</span></td>
            <td class="a-text-center"><span>${item.unitCount}</span></td>
            <td class="a-text-center"><span>${item.poList}</span></td>
        `;
        tableBody.appendChild(row); // 将新行添加到表格体中
    });
}

// 假设页面加载后执行populateTable
document.addEventListener('DOMContentLoaded', populateTable);
