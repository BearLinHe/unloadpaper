window.addEventListener('DOMContentLoaded', (event) => {
    loadContent('../html/unloadingPaper.html'); // 页面加载时自动加载 PDF 生成器
});

document.getElementById('linkPdfGenerator').addEventListener('click', function (e) {
    e.preventDefault(); // 阻止默认的链接跳转
    loadContent('../html/pdfGenerator.html');
});

document.getElementById('linkBoardCalculator').addEventListener('click', function (e) {
    e.preventDefault();
    loadContent('../html/boardCalculator.html');
});

document.getElementById('linkunloadingPaper').addEventListener('click', function (e) {
    e.preventDefault();
    loadContent('../html/unloadingPaper.html');
});

document.getElementById('linkContainerStatics').addEventListener('click', function (e) {
    e.preventDefault();
    loadContent('../html/containerStatics.html');
});

document.getElementById('linkDestinationStatic').addEventListener('click', function (e) {
    e.preventDefault();
    loadContent('../html/destinationStatic.html');
});

document.getElementById('linkGenerateQRCode').addEventListener('click', function (e) {
    e.preventDefault();
    loadContent('../html/generateQRCode.html');
});

function loadContent(page) {
    document.getElementById('content').innerHTML = '<object type="text/html" data="' + page + '" style="width:100%; height:100%;" ></object>';
}


function openNewWindow() {
    var url = '../POD/View - Carrier Central.html'; // 确保路径正确
    var windowFeatures = "width=" + screen.width + ",height=" + screen.height + ",left=0,top=0,location=no,scrollbars=yes,status=yes";
    window.open(url, "_blank", windowFeatures);
}

