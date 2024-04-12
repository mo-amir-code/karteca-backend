import express, { Router } from "express";
import { createBanner, getHomeSliderBanners, getSingleBanner } from "../controllers/bannerController.js";

const router: Router = express.Router();

router
    .get("/home-slider", getHomeSliderBanners)
    .get("/single", getSingleBanner)
    .post("/", createBanner)


export default router;