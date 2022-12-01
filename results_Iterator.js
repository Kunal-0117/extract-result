const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");

const btechStudents = require('./students/btechStudents.json');
const bcaStudents = require('./students/bcaStudents.json');

const btechUrl = "https://www.poornima.edu.in/results/result_btech_all_isem.php?id=";
const bcaUrl = "https://www.poornima.edu.in/results/result_bca_isem_all.php?id="

function fetchResult(url, student) {
    return new Promise((resolve, reject) => {
        request(url + student.reg, function (error, response, body) {
            if (error) {
                console.log(error);
                reject(error);
            }
            else {
                const $ = cheerio.load(body);
                const rawSgpa = $(".result_table_Frmt tbody tr:nth-child(2) td table tbody tr:nth-child(22) td");
                let sgpa = getSGPA(rawSgpa.text());
                student.sgpa = sgpa;

                if (!student.roll) {
                    let roll = $('.result_table_Frmt tbody tr:nth-child(2) td table tbody tr:nth-child(3) td:nth-child(2)').text();
                    student.roll = roll;
                }

                resolve(sgpa);
            }
        });

    })
}


function getSGPA(str) {
    let rawSgpa = str.slice(7);   //index at which "SGPA = " finishes and after which real sgpa starts.
    return parseFloat(rawSgpa);
}



async function getResults(url, students) {
    resultFetcher = {
        [Symbol.asyncIterator]() {
            return {
                url: url,
                students: students,
                current: 0,
                end: students.length - 1,
                async next() {
                    let sgpa = await fetchResult(url, this.students[this.current]);
                    return (this.current++ < this.end) ?
                        { done: false, value: sgpa }
                        : { done: true };
                }
            }
        }
    }


    for await (let count of resultFetcher) {
        console.log(count);
    };

    fs.writeFile("results/bca_sgpa.json", JSON.stringify(students, null, 2), (err) => {
        err ? console.error(err) : console.log("Successfully written data to file");
    });


}

getResults(bcaUrl, bcaStudents);