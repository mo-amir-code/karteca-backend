import Product from "../models/Product.js";
import RatingAndReviewsModel from "../models/RatingAndReviews.js";
import BannerModel from "../models/Banner.js";
import { TryCatch } from "../middlewares/error.js";
import ErrorHandler from "../utils/utility-class.js";
import { CProductType } from "../types/user.js";

export const getAllProducts = TryCatch(async (req, res) => {
  const smartWatches = await Product.find({
    $and: [{ category: "audio and video" }, { subCategory: "smart" }],
  })
    .sort({ sold: -1 })
    .limit(6);
  const wirelessItems = await Product.find({
    $and: [{ category: "audio" }, { subCategory: "wireless" }],
  })
    .sort({ sold: -1 })
    .limit(6);
  const wiredItems = await Product.find({
    $and: [{ category: "audio" }, { subCategory: "wired" }],
  })
    .sort({ sold: -1 })
    .limit(6);

  return res.status(200).json({
    success: true,
    message: "Products fetched.",
    data: {
      smartWatches,
      wirelessItems,
      wiredItems,
    },
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
