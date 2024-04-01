import Product from "../models/Product.js";
import RatingAndReviews from "../models/RatingAndReviews.js";
import BannerModel from "../models/Banner.js";
import { TryCatch } from "../middlewares/error.js";
import ErrorHandler from "../utils/utility-class.js";
import { CProductType } from "../types/user.js";
import { redis } from "../utils/Redis.js";
import { calculateRatingAndReviews } from "../utils/services.js";
import { FilterProductType } from "../types/searchType.js";

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

export const searchProduct = TryCatch(async (req, res) => {
  const {sort, category, discount, minvalue, maxvalue, rating, query, page, limit} = req.query as unknown as FilterProductType;

  let intPage = parseInt(page);
  let intLimit = parseInt(limit);
  let intMinValue = parseInt(minvalue);
  let intMaxValue = parseInt(maxvalue);
  let intRating = parseInt(rating);

  const childCategories = category?.split(",") || [];
  let queryDiscount = (discount?.split(",") || []).map(Number);
  const lowestDiscount = Math.min(...queryDiscount);
  
  let queryFilters: any = {};

  if (discount) queryFilters.discount = { $gte: lowestDiscount };
  if (minvalue) queryFilters.price = { $gte: intMinValue };
  if (maxvalue) queryFilters.price = { ...queryFilters.price, $lte: intMaxValue };

  if (childCategories.length > 0 && childCategories[0] !== "") {
    queryFilters['category.child'] = { $in: childCategories }; 
  }

  let sortQuery:any = {};
  if(sort){
    switch(sort){
      case "top":
        sortQuery.sold = -1;
        break;
      case "newest":
        sortQuery.createdAt = 1;
        break;
      case "lowest":
        sortQuery.price = 1;
        break;
      case "highest":
        sortQuery.price = -1;
        break;
      default:
        break;
    }
  }

  let totalItems = await Product.countDocuments(queryFilters).sort(sortQuery)

  let filteredProducts = await Product.find(queryFilters)
    .sort(sortQuery)
    .skip((intPage - 1) * intLimit)
    .limit(intLimit);

  filteredProducts = await Promise.all(
    filteredProducts.map(async (item) => {
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
          avgRating: avgRating > 0? avgRating : 0
        }
      }
    })
  );

  if(rating){
    filteredProducts = filteredProducts.filter((item) => item.ratingAndReviews.avgRating >= intRating);
  }

  return res.status(200).json({
    success: true,
    message: "Products filtered",
    data:{
      products: filteredProducts,
      totalPage: Math.ceil(totalItems / intLimit)
    }
  });
});

export const getCategories = TryCatch(async (req, res, next) => {

  let categories = await Product.find().select("category");

  categories = categories.map((item) => {
    const newItem = JSON.parse(JSON.stringify(item));
    return newItem.category.child;
  });

  let filteredCategories = [...new Set(categories)].map((cat:string) => {
    return {
      name: cat.at(0)?.toUpperCase() + cat.slice(1),
      value: cat
    }
  })

  return res.status(200).json({
    success: true,
    message: "Categories fetched",
    data: filteredCategories
  });
});
