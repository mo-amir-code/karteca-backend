import { TryCatch } from "../middlewares/error.js";
import Banner from "../models/Banner.js"
import { redis } from "../utils/redis/Redis.js";
import { homeSliderBannerKey, singleBannerKey } from "../utils/redis/redisKeys.js";

export const getHomeSliderBanners = TryCatch(async (req, res, next) => {

    const catchedBanners = await redis?.get(homeSliderBannerKey);

    if(catchedBanners){
        return res.status(200).json({
            success: true,
            message: "Banners fetched",
            data: JSON.parse(catchedBanners)
        });
    }

    let banners = await Banner.find({$and: [{ promotionExpiry:  { $gt: Date.now() }}, { promotionStart: { $lte: Date.now() } }]}).populate({ path: "transaction", select: "status" }).select("product bannerUrl position transaction");

    // Filtering payment successed banners
    banners = (banners || []).filter((item) => {
        if(item.transaction.status === "success") return true;
        return false;
    });

    if(banners.length === 0){
        banners = await Banner.find({"compaigner.type": "admin"}).limit(6);
    }

    await redis?.set(homeSliderBannerKey, JSON.stringify(banners));

    return res.status(200).json({
        success: true,
        message: "Banners fecthed",
        data: banners
    })
});

export const getSingleBanner = TryCatch(async (req, res, next) => {

    const catchedBanners = await redis?.get(singleBannerKey);

    if(catchedBanners){
        return res.status(200).json({
            success: true,
            message: "Banner fetched",
            data: JSON.parse(catchedBanners)
        });
    }

    
    const banner = await Banner.find({"compaigner.type": "admin"}).limit(1);

    await redis?.set(singleBannerKey, JSON.stringify(banner[0]));

    return res.status(200).json({
        success: true,
        message: "Banner fetched",
        data: banner[0]
    })
});

export const createBanner = TryCatch(async (req, res, next) => {

    // const data = req.body as 
    return res.json({
        message: "This route is in under contructions"
    })

});