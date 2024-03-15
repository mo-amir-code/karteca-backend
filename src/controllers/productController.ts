import Product from "../models/Product.js";
import RatingAndReviews from "../models/RatingAndReviews.js";
import BannerModel from "../models/Banner.js";
import { TryCatch } from "../middlewares/error.js";
import ErrorHandler from "../utils/utility-class.js";
import { CProductType } from "../types/user.js";
import { redis } from "../utils/Redis.js";
import { calculateRatingAndReviews } from "../utils/services.js";

export const getTopProducts = TryCatch(async (req, res) => {
  // const cathedData = await redis.get("topProducts");

  // if(cathedData){
  //   return res.status(200).json({
  //     success: true,
  //     message: "Top Products fetched. catched",
  //     data: JSON.parse(cathedData)
  //   });
  // }

  const topProducts = await Product.find()
    .sort({ sold: -1 })
    .select("_id title price stock discount thumbnail")
    .limit(5);
  // await redis.set("topProducts", JSON.stringify(topProducts));

  const updatedTopProducts = await Promise.all(
    topProducts.map(async (item) => {
      const ratingAndReviews = await RatingAndReviews.find({
        product: item._id,
      });

      const { totalReviews, avgRating } =
        await calculateRatingAndReviews(ratingAndReviews);

      const newItem = await JSON.parse(JSON.stringify(item));

      return {
        ...newItem,
        ratingAndReviews: {
          totalReviews,
          avgRating: avgRating > 0 ? avgRating : 0,
        },
      };
    })
  );

  // console.log(updatedTopProducts)

  return res.status(200).json({
    success: true,
    message: "Top Products fetched.",
    data: updatedTopProducts,
  });
});

export const getLatestProducts = TryCatch(async (req, res) => {
  // const cathedData = await redis.get("topProducts");

  // if(cathedData){
  //   return res.status(200).json({
  //     success: true,
  //     message: "Top Products fetched. catched",
  //     data: JSON.parse(cathedData)
  //   });
  // }

  const topProducts = await Product.find().sort({ sold: -1 }).limit(5);
  // await redis.set("topProducts", JSON.stringify(topProducts));

  return res.status(200).json({
    success: true,
    message: "Latest Products fetched.",
    data: topProducts,
  });
});

export const getComboProducts = TryCatch(async (req, res) => {
  // const cathedData = await redis.get("topProducts");

  // if(cathedData){
  //   return res.status(200).json({
  //     success: true,
  //     message: "Top Products fetched. catched",
  //     data: JSON.parse(cathedData)
  //   });
  // }

  const topProducts = await Product.find().sort({ sold: -1 }).limit(5);
  // await redis.set("topProducts", JSON.stringify(topProducts));

  return res.status(200).json({
    success: true,
    message: "Combo's Products fetched.",
    data: topProducts,
  });
});

export const getProductById = TryCatch(async (req, res, next) => {
  const { productId } = req.params;

  if (!productId) {
    return next(new ErrorHandler("Product Id is not found.", 404));
  }

  const product = await Product.findById(productId).select("-ownerId");
  const ratingAndReviews = await RatingAndReviews.find({
    product: product._id,
  });

  const { totalRating, totalReviews, avgRating } =
    await calculateRatingAndReviews(ratingAndReviews);

  return res.status(200).json({
    success: true,
    message: "Product has been founded.",
    data: {
      product,
      avgRating: avgRating > 0 ? avgRating : 0,
      totalRating,
      totalReviews,
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
