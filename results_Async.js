// OLD
const request = require('request');
const cheerio = require("cheerio");
const fs = require("fs");
const async = require('async');
const students = require('./students/btechStudents.json');


function getSGPA(str) {
  let rawSgpa = str.slice(7);   //index at which "SGPA = " finishes and after which real sgpa starts.
  return parseFloat(rawSgpa);
}

function getResults(students) {
  let count = 0;
  async.eachSeries(students, function (student, cbin) {
    request(`https://www.poornima.edu.in/results/result_btech_all_isem.php?id=${student.reg}`, function (error, response, body) {
      if (error) {
        console.log(error);
      }
      else {
        const $ = cheerio.load(body);
        const rawSgpa = $(".result_table_Frmt tbody tr:nth-child(2) td table tbody tr:nth-child(22) td");
        let sgpa = getSGPA(rawSgpa.text());
        student.sgpa = sgpa;
        console.log(count);
        count++;
      }
      setTimeout(cbin, 1000);
    });
  }, function () {
    fs.writeFile("btech.json", JSON.stringify(students, null, 2), (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("Successfully written data to file");
    });
  });
}

getResults(students);
