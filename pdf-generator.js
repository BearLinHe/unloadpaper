
document.getElementById('pdfForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const containerNumber = document.getElementById('containerNumber').value;
    const destinationNumbers = document.getElementById('destinationNumbers').value.split('\n');
    const pageNumbers = document.getElementById('pageNumbers').value.split('\n');
    const customerName = document.getElementById('customerName').value;
    const date = document.getElementById('date').value;

    for (let i = 0; i < destinationNumbers.length; i++) {
        if (destinationNumbers[i].trim() !== '') {
            generatePDF(containerNumber, destinationNumbers[i].trim(), customerName, date, pageNumbers[i]);
        }
    }

});

function generatePDF(containerNumber, destinationNumber, customerName, date, pageNumber) {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
        orientation: "landscape",
    });

    const pageWidth = pdf.internal.pageSize.width;

    pdf.setFont("helvetica", "bold");

    const firstLineText = containerNumber;
    pdf.setFontSize(100);
    const firstLineTextWidth = pdf.getTextWidth(firstLineText);
    pdf.text(firstLineText, (pageWidth - firstLineTextWidth) / 2, 60);

    const secondLineText = destinationNumber;
    pdf.setFontSize(100);
    const secondLineTextWidth = pdf.getTextWidth(secondLineText);
    if (secondLineTextWidth > pageWidth) {
        pdf.setFontSize(65);
        const secondLineTextWidth = pdf.getTextWidth(secondLineText);
        pdf.text(secondLineText, (pageWidth - secondLineTextWidth) / 2, 100);
    } else {
        pdf.text(secondLineText, (pageWidth - secondLineTextWidth) / 2, 100);
    }


    const thirdLineText = customerName;
    pdf.setFontSize(50);
    const thirdLineTextWidth = pdf.getTextWidth(thirdLineText);
    pdf.text(thirdLineText, (pageWidth - thirdLineTextWidth) / 2, 140);

    const fourthLineText = date;
    pdf.setFontSize(100);
    const fourthLineTextWidth = pdf.getTextWidth(fourthLineText);
    pdf.text(fourthLineText, (pageWidth - fourthLineTextWidth) / 2, 180);

    const fifthLineText = `total: ${pageNumber} pages`;
    pdf.setFontSize(15);
    const fifthLineTextWidth = pdf.getTextWidth(fifthLineText);
    pdf.text(fifthLineText, (pageWidth - fifthLineTextWidth) * 4 / 5, 200);

    // pdf.save(`${destinationNumber}_${pageNumber}.pdf`);


    const pdfBlob = pdf.output('blob');

    // 打开新窗口并显示PDF，准备打印
    const url = URL.createObjectURL(pdfBlob);
    const printWindow = window.open(url);
    printWindow.onload = function () {
        printWindow.print();
    };
}
