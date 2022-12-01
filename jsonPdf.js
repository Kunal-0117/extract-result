import { createRequire } from "module";
const require = createRequire(import.meta.url);

let html_to_pdf = require('html-pdf-node');
const cheerio = require("cheerio");


let template = `<!DOCTYPE html>
<html>

<head>
    <style>
        #table {
            font-family: Arial, Helvetica, sans-serif;
            border-collapse: collapse;
            width: 100%;
            margin:auto;
        }

        #table td,
        #table th {
            // border: 1px solid #ddd;
            padding: 8px;
            font-size:12px;
        }

        #table tr:nth-child(even) {
            background-color: #f2f2f2;
        }

        #table tr:hover {
            background-color: #ddd;
        }

        #table th {
            padding-top: 12px;
            padding-bottom: 12px;
            text-align: left;
            background-color: #1e272e;
            color: white;
        }
    </style>
</head>

<body>
    <table id="table">
        <thead>
            <tr>

            </tr>
        </thead>
        <tbody>

        </tbody>
    </table>

</body>

</html>`

let darkTemplate = `<!DOCTYPE html>
<html>

<head>
<style>
body {
    background-color: #121212;
}

#table {
    font-family: Arial, Helvetica, sans-serif;
    border-collapse: collapse;
    width: 70%;
    margin: auto;
    color: rgb(174, 174, 174);
}


#table td,
#table th {
    padding: 8px;
    font-size: 12px;
}

#table tbody tr:nth-child(odd) {
    background-color: #19191a;
}

#table tr td:last-child{
    color: #f6ca45;
}


#table th {
    padding-top: 12px;
    padding-bottom: 12px;
    text-align: left;
    color: #ECF0F1;
}
</style>
</head>

<body>
    <table id="table">
        <thead>
            <tr>

            </tr>
        </thead>
        <tbody>
    
        </tbody>
    </table>

</body>

</html>`


function populateHTML(html, json) {
    const $ = cheerio.load(html);

    let thead = $("#table thead tr");
    let headings = [];
    Object.keys(json[0]).forEach((key, index) => {
        let child = `<th>${key.toUpperCase()}</th>`;
        thead.append(child);
        headings[index] = key;
    })



    let tbody = $("#table tbody");

    for (let obj of json) {
        let row = "<tr>"

        for (let heading of headings) {
            row += `<td>${obj[heading]}</td>`;
        }
        row += "</tr";

        tbody.append(row);
    }

    return $.html();
}

function jsonPDF(json, pdfName, path = "") {
    let html = populateHTML(template, json);

    const options = {
        format: 'A4',
        args: ['--force-dark-mode'],
        path: path + pdfName + ".pdf",
        printBackground: true,
        margin: {
            top: "10mm",
            bottom: "20mm",
            left: 0,
            right: 0,
        },
        displayHeaderFooter: true,
        headerTemplate: "<div></div>",
        footerTemplate: '<div style=" margin: auto; text-align:center; font-size: 8px;">Page: <span class="pageNumber">{{page}}</span>/<span class="totalPages"></span></div>',
    };

    let file = { content: html };
    html_to_pdf.generatePdf(file, options).then(() => {
        console.log(`Successfully written data to ${pdfName}.pdf`);
    });

}

export default jsonPDF;