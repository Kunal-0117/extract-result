import { createRequire } from "module";
const require = createRequire(import.meta.url);


const xl = require('excel4node');
const wb = new xl.Workbook();
const ws = wb.addWorksheet('Sheet1');

function jsonToExcel(json, excelName,path="") {

    //headings
    let headingStyle = wb.createStyle({
        font: {
            bold: true,
            size: 12,
        },
    });
    let headings = [];
    Object.keys(json[0]).forEach((heading, index) => {
        ws.cell(1, index + 1).string(heading.toUpperCase()).style(headingStyle);
        headings.push(heading);
    })

    //row filling
    json.forEach((obj, indexR) => {
        headings.forEach((heading, indexC) => {
            ws.cell(indexR + 2, indexC + 1).string(obj[heading] + "");
        })
    })

    wb.write(path + excelName + ".xlsx");

    console.log(`Successfully written data to ${excelName}.xlsx`);
}

export {jsonToExcel,excelToJson};