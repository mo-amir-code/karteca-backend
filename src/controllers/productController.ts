import Product from "../models/Product.js";
import RatingAndReviewsModel from "../models/RatingAndReviews.js";
import BannerModel from "../models/Banner.js";
import { TryCatch } from "../middlewares/error.js";
import ErrorHandler from "../utils/utility-class.js";
import { CProductType } from "../types/user.js";
import { redis } from "../utils/Redis.js";

export const getTopProducts = TryCatch(async (req, res) => {


  const cathedData = await redis.get("topProducts");

  if(cathedData){
    return res.status(200).json({
      success: true,
      message: "Top Products fetched. catched",
      data: JSON.parse(cathedData)
    });
  }

  const topProducts = await Product.find().sort({ sold: -1 })
  await redis.set("topProducts", JSON.stringify(topProducts));

  return res.status(200).json({
    success: true,
    message: "Top Products fetched.",
    data: topProducts
  });
});

export const getProductById = TryCatch(async (req, res, next) => {
  const { productId } = req.params;

  if (!productId) {
    return next(new ErrorHandler("Product Id is not found.", 404));
  }

  const product = await Product.findById(productId).select("-ownerId");
  const ratingAndReviews = await RatingAndReviewsModel.find({
    product: product._id,
  });

  let rating = await ratingAndReviews.reduce((rate: number, current: any) => {
    return rate + current.rate;
  }, 0);

  rating = rating / ratingAndReviews.length;

  return res.status(200).json({
    success: true,
    message: "Product has been founded.",
    data: {
      product,
      rating,
      ratingAndReviews,
    },
  });
});

export const getBanners = TryCatch(async (req, res) => {
    const banners = await BannerModel.find({
      $and: [
        { promotionStart: { $gt: Date.now() } },
        { promotionExpiry: { $ls: Date.now() } },
      ],
    }).select("-promotionExpiry -promotionStart -userId");

    return res.status(200).json({
      success: true,
      message: "Banners fetched.",
      data: banners,
    });
});

export const createProduct = TryCatch(async (req, res) => {
    const product = req.body as CProductType;

    await Product.create(product);

    return res.status(200).json({
      success: true,
      message: "Product added.",
    });
});
