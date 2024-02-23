window.addEventListener('DOMContentLoaded', (event) => {
    loadContent('../html/pdfGenerator.html'); // 页面加载时自动加载 PDF 生成器
});

document.getElementById('linkPdfGenerator').addEventListener('click', function (e) {
    e.preventDefault(); // 阻止默认的链接跳转
    loadContent('../html/pdfGenerator.html');
});

document.getElementById('linkBoardCalculator').addEventListener('click', function (e) {
    e.preventDefault();
    loadContent('../html/boardCalculator.html');
});

function loadContent(page) {
    document.getElementById('content').innerHTML = '<object type="text/html" data="' + page + '" style="width:100%; height:100%;" ></object>';
}
