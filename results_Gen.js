import { createRequire } from "module";
const require = createRequire(import.meta.url);
import {jsonToExcel} from "./jsonExcel.js";
import jsonPdf from "./jsonPdf.js";


const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");

const students = {
    btech: require('./students/btechStudents.json'),
    bca: require('./students/bcaStudents.json'),
    barch: require('./students/barchStudents.json'),
    bscPcm: require('./students/bscPCMStudents.json'),
    bscGaming: require('./students/bscGamingStudents.json'),
    bscEs: require('./students/bscEsStudents.json'),
    bscAnimation: require('./students/bscAnimationStudents.json'),
    bvaAppArt: require('./students/bvaAppArtStudents.json'),
    bvaPainting: require('./students/bvaPaintingStudents.json'),
    bdesFashion: require('./students/bdesFashionStudents.json'),
    bdesInterior: require('./students/bdesInteriorStudents.json'),
    baHonEco: require('./students/baHonEcoStudents.json'),
    baHonEnglish: require('./students/baHonEnglishStudents.json'),
}
const urls = {
    btech: "https://www.poornima.edu.in/results/result_btech_all_isem.php?id=",
    bca: "https://www.poornima.edu.in/results/result_bca_isem_all.php?id=",
    barch: "https://www.poornima.edu.in/results/result_barch_isem.php?id=",
    bscPcm: "https://www.poornima.edu.in/results/result_bsc_isem_pcm.php?id=",
    bscGaming: "https://www.poornima.edu.in/results/result_bsc_isem_gaming.php?id=",
    bscEs: "https://www.poornima.edu.in/results/result_bsc_isem_es.php?id=",
    bscAnimation: "https://www.poornima.edu.in/results/result_bsc_isem_animation.php?id=",
    bvaAppArt: "https://www.poornima.edu.in/results/result_bva_isem_aa.php?id=",
    bvaPainting: "https://www.poornima.edu.in/results/result_bva_isem_painting.php?id=",
    bdesFashion: require('./students/bdesFashionStudents.json'),
    bdesInterior: require('./students/bdesInteriorStudents.json'),
    baHonEco: require('./students/baHonEcoStudents.json'),
    baHonEnglish: "https://www.poornima.edu.in/results/result_ba_isem_eng.php?id=",
}

// const courses = ["btech", "bca", "barch", "bscPcm", "bscGaming", "bscEs", "bscAnimation", "bvaAppArt", "bvaPainting", "bdesFashion", "bdesInterior", "baHonEco", "baHonEnglish"]
const courses = ["btech", "bca", "barch", "bscPcm", "bscGaming", "bscEs", "bscAnimation", "bvaAppArt", "bvaPainting"]

async function getRawHTML(url) {
    return new Promise((resolve, reject) => {
        request(url, function (error, response, body) {
            error ? reject(error) : resolve(body);
        })
    }
    )
}

function cheerioRawHTML(rawHTML) {
    return cheerio.load(rawHTML);
}

function parseSGPA(cheerioHTML) {
    let rawSgpa = cheerioHTML(".result_table_Frmt tbody tr:nth-child(2) td table tbody tr:nth-last-child(2) td").text();
    let sgpa = parseFloat(rawSgpa.slice(7)); //index at which "SGPA = " finishes and after which real sgpa starts.
    return sgpa;
}

function parseRoll(cheerioHTML) {
    let roll = cheerioHTML('.result_table_Frmt tbody tr:nth-child(2) td table tbody tr:nth-child(3) td:nth-child(2)').text();
    return roll;
}

async function fetchSingleResult(url, student) {
    try {
        let rawHTML = await getRawHTML(url);
        let cheerioHTML = cheerioRawHTML(rawHTML);
        if (!student.roll) {
            student.roll = parseRoll(cheerioHTML);
        }
        student.sgpa = parseSGPA(cheerioHTML);
        return student.sgpa;
    }
    catch (error) {
        return Promise.reject(error);
    }

}

function createJSON(obj, fileName, path = "") {
    fs.writeFile(path + fileName + ".json", JSON.stringify(obj, null, 2), (err) => {
        err ? console.error(err) : console.log(`Successfully written data to file ${fileName}.json`);
    });
}

async function getResults(url, students, fileName) {

    const results = async function* () {
        for (let student of students) {
            let sgpa = await fetchSingleResult(url + student.reg, student);
            yield sgpa;
        }
    }

    for await (let sgpa of results()) {
        // console.log(sgpa);
    }

    createJSON(students, fileName, './results/json/');
    jsonToExcel(students, fileName +".json", './results/excel/');
    jsonPdf(students, fileName, "./results/formattedPDF/");
}

getResults(urls.baHonEnglish, students.baHonEnglish, "baHonEnglish_sgpa");
getResults(urls.bvaAppArt, students.bvaAppArt, "bvaAppArt_sgpa");