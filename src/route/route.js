import express from "express";
import{
  test ,
  createFile,
  readFile,
  getCommonData,
  generatePdf
}from "../controller/controller.js";
const router=express.Router();
router.route("/test").get(test);
router.route("/createFile").get(createFile);
router.route("/readFile").get(readFile);
router.route("/getCommonData").get(getCommonData);
router.route("/generatePdf").get(generatePdf);
export default router;