import express from "express";
import{
  test ,
  createFile,
  readFile,
  getCommonData
}from "../controller/controller.js";
const router=express.Router();
router.route("/test").get(test);
router.route("/createFile").get(createFile);
router.route("/readFile").get(readFile);
router.route("/getCommonData").get(getCommonData);
export default router;