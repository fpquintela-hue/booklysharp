import ExcelJS from 'exceljs';

export async function exportToExcel(data: any[], fileName: string) {
    if (!data || data.length === 0) return;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Datos');

    const headers = Object.keys(data[0]);
    worksheet.columns = headers.map(header => ({ header, key: header }));
    worksheet.addRows(data);

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
}
