import ResponseConfig from "../helper/responseConfig.js";
import AsyncHandler from "../helper/asyncHandler.js";
import ErrorConfig from "../helper/errorResponse.js";
import path,{ dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from "fs/promises";
import PDFParser from "pdf2json"; 
const pdfParser = new PDFParser();
import {jsPDF} from "jspdf";
import "jspdf-autotable";
// Recreate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const test=AsyncHandler((req,res,next)=>{
  const bool=false;
  if(bool){
    res.status(200).json(new ResponseConfig(200,"this is test message"));
  }else{
    next(new ErrorConfig(401,"authontication error"));
  }
});
const createFile=AsyncHandler( async(req,res,next)=>{
  const filePath=path.resolve(__dirname,"../../assets/test1.txt");
  await fs.writeFile(filePath,"This is test message1","utf-8");
    res.json(new ResponseConfig(200,"file created successfully"));
})
const readFile = AsyncHandler(async (req, res, next) => {
  const filePath = path.join(__dirname, "../../assets/");
  let fileName = "manu";

  pdfParser.on("pdfParser_dataError", (errData) => {
    console.error(errData.parserError);
    next(new ErrorConfig(500, "Error parsing PDF"));
  });

  pdfParser.on("pdfParser_dataReady", (pdfData) => {
    const structuredData = [];

    // Extract and structure data from the PDF
    pdfData.Pages.forEach((page) => {
      const rows = {};
      page.Texts.forEach((text) => {
        const y = text.y; // Y-coordinate to group by rows
        const value = decodeURIComponent(text.R[0].T); // Decoded text
        if (!rows[y]) rows[y] = [];
        rows[y].push(value);
      });

      // Convert rows into structured objects
      Object.values(rows).forEach((row) => {
        if (row.length === 5) { // Adjust this to match your column count
          structuredData.push({
            sn: row[0],
            primaryKey: row[1],
            name: row[2],
            gender: row[3],
            dob:row[4]
          });
        }
      });
    });

    // Save structured data to JSON
    fs.writeFile(
      filePath + fileName + ".json",
      JSON.stringify(structuredData, null, 2),
      "utf-8"
    )
      .then(() => {
        console.log("Done.");
        res.json(new ResponseConfig(200, "Data successfully written to JSON"));
      })
      .catch((err) => {
        console.error(err);
        next(new ErrorConfig(500, "Error writing JSON file"));
      });
  });

  pdfParser.loadPDF(filePath + fileName + ".pdf");
});
const getCommonData=AsyncHandler(async(req,res,next)=>{
  const filePath = path.join(__dirname, "../../assets/");
  let manuData=await fs.readFile(`${filePath}manu.json`,"utf-8");
  let agreesData=await fs.readFile(`${filePath}agrees.json`,"utf-8");
  let commonDatas=[];
  manuData=JSON.parse(manuData);
  agreesData=JSON.parse(agreesData);
  manuData.forEach(manu=>{
    agreesData.forEach(agrees=>{
      let str=agrees.dob;
     let agreesDob=str.slice(0,4)+"-"+str.slice(4,6)+"-"+str.slice(-2);
      if(manu.name===agrees.name && manu.dob===agreesDob){
        commonDatas.push(manu);
      }
    })
  })
  console.log({commonDatas,totalMembers:commonDatas.length})
  await fs.writeFile(
      filePath+"commonData.json",
      JSON.stringify(commonDatas, null, 2),
      "utf-8"
    )
    res.json(new ResponseConfig(200,commonDatas))
})

const generatePdf = AsyncHandler(async(req, res) => {
  const doc = new jsPDF();
  const filePath = path.join(__dirname, "../../assets/");
  // Example data for the table
  let data =JSON.parse(await fs.readFile(filePath+"commonData.json"));
  data.sort((a,b)=>a.name.localeCompare(b.name));
  data.unshift({sn:"s.n",primaryKey:"primaryKey",name:"name",gender:"gender",dob:"dob"});
// Add table title (above the table)
  doc.setFontSize(14);
  doc.text("Common members from manufacture and agreeculture for korean language exam", 10, 10); // Positioning the title at coordinates (14, 20)
// Use autoTable to generate the table
let columns=data[0];
data.shift();
let rows=data;
  doc.autoTable({
    head: [columns], // Table header
    body: rows,      // Table rows
  });
  // Send the PDF as a response to the client
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=commonDatas.pdf");
  res.send(doc.output());
});
export{
  test,
  createFile,
  readFile,
  getCommonData,
  generatePdf
}