import Product from "../models/Product.js";
import RatingAndReviews from "../models/RatingAndReviews.js";
import BannerModel from "../models/Banner.js";
import { TryCatch } from "../middlewares/error.js";
import ErrorHandler from "../utils/utility-class.js";
import { CProductType } from "../types/user.js";
import { redis } from "../utils/redis/Redis.js";
import {
  calculateRatingAndReviews,
  formatProductsDataForProductCard,
  makeFirstLetterCap,
} from "../utils/services.js";
import { FilterProductType } from "../types/searchType.js";
import CategoriesWithImage from "../models/CategoriesWithImage.js";
import { CategoryWithImageType } from "../types/product.js";
import { comboProductsKey, getProductDetailsKey, getProductRatingAndReviewsKey, getProductRatingKey, latestProductsKey, productCategoriesKey, productCategoriesWithImageKey, topProductsKey } from "../utils/redis/redisKeys.js";

export const getTopProducts = TryCatch(async (req, res) => {
  const cachedData = await redis?.get(topProductsKey);

  if (cachedData) {
    return res.status(200).json({
      success: true,
      message: "Top Products fetched. catched",
      data: JSON.parse(cachedData),
    });
  }

  const topProducts = await Product.find()
    .sort({ sold: -1 })
    .select("_id title price stock discount thumbnail")
    .limit(5);

  const updatedTopProducts = await formatProductsDataForProductCard(
    topProducts
  );

  if(updatedTopProducts.length >= 5){ 
    await redis?.set(topProductsKey, JSON.stringify(updatedTopProducts));
  }

  return res.status(200).json({
    success: true,
    message: "Top Products fetched.",
    data: updatedTopProducts,
  });
}); // redis done

export const getLatestProducts = TryCatch(async (req, res) => {
  const cachedData = await redis?.get(latestProductsKey);

  if (cachedData) {
    return res.status(200).json({
      success: true,
      message: "Latest Product Fetched",
      data: JSON.parse(cachedData),
    });
  }

  let latestProducts = await Product.find()
    .select("_id title price stock discount thumbnail")
    .sort({ createdAt: 1 })
    .limit(5);
  latestProducts = await formatProductsDataForProductCard(latestProducts);

  if(latestProducts.length >= 5){
    await redis?.set(latestProductsKey, JSON.stringify(latestProducts));
  }

  return res.status(200).json({
    success: true,
    message: "Latest Products fetched.",
    data: latestProducts,
  });
}); // redis done

export const getComboProducts = TryCatch(async (req, res) => {
  const cachedData = await redis?.get(comboProductsKey);

  if (cachedData) {
    return res.status(200).json({
      success: true,
      message: "Combo Products fetched",
      data: JSON.parse(cachedData),
    });
  }

  let comboProducts = await Product.find().limit(5);

  comboProducts = await formatProductsDataForProductCard(comboProducts);

  if(comboProducts.length >= 5){
    await redis?.set(comboProductsKey, JSON.stringify(comboProducts));
  }

  return res.status(200).json({
    success: true,
    message: "Combo's Products fetched.",
    data: comboProducts,
  });
}); // redis done

export const getProductById = TryCatch(async (req, res, next) => {
  const { productId } = req.params;

  if (!productId) {
    return next(new ErrorHandler("Product Id is not found.", 400));
  }

  let product = await Product.findById(productId).select("-ownerId -sellerId -category");

  if(!product){
    return next(new ErrorHandler("Product not found", 400));
  }

  product = await JSON.parse(JSON.stringify(product));
  product = {
    ...product,
    thumbnail: product?.thumbnail?.url,
    images: product?.images?.map((img: any) => img.url),
  };

  let rate;

  const catchedRating = await redis?.get(getProductRatingKey(productId));

  if (!catchedRating) {
    const ratingAndReviews = await RatingAndReviews.find({
      product: product._id,
    });
    rate = await calculateRatingAndReviews(ratingAndReviews);
    await redis?.set(getProductRatingKey(productId), JSON.stringify(rate));
  } else {
    rate = JSON.parse(catchedRating);
  }

  const { avgRating, totalRating, totalReviews } = rate;

  const newProduct = {
    product,
    avgRating: avgRating > 0 ? avgRating : 0,
    totalRating,
    totalReviews,
  };

  await redis?.set(getProductDetailsKey(product._id), JSON.stringify(newProduct));

  return res.status(200).json({
    success: true,
    message: "Product has been founded.",
    data: newProduct,
  });
}); // redis done

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
  const {
    sort,
    category,
    discount,
    minvalue,
    maxvalue,
    rating,
    query,
    page,
    limit,
  } = req.query as unknown as FilterProductType;

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
  if (maxvalue)
    queryFilters.price = { ...queryFilters.price, $lte: intMaxValue };

  if (childCategories.length > 0 && childCategories[0] !== "") {
    queryFilters["category.child"] = { $in: childCategories };
  }

  let sortQuery: any = {};
  if (sort) {
    switch (sort) {
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

  if (query) {
    const regex = new RegExp(query.trim().split(/\s+/).join("|"), "i");
    queryFilters.$or = [
      { title: regex },
      { description: regex },
      { "category.child": regex },
    ];
  }

  let totalItems = await Product.countDocuments(queryFilters).sort(sortQuery);

  let filteredProducts = await Product.find(queryFilters)
    .select("_id title price stock discount thumbnail")
    .sort(sortQuery)
    .skip((intPage - 1) * intLimit)
    .limit(intLimit);

  filteredProducts = await Promise.all(
    filteredProducts.map(async (item) => {
      const newItem = await JSON.parse(JSON.stringify(item));

      const catchedRatingAndReviews = await redis?.get(getProductRatingAndReviewsKey(item._id));

      if (catchedRatingAndReviews) {
        return {
          ...newItem,
          thumbnail: newItem.thumbnail.url,
          ratingAndReviews: JSON.parse(catchedRatingAndReviews),
        };
      }

      const ratingAndReviews = await RatingAndReviews.find({
        product: item._id,
      });

      const { totalReviews, avgRating } = await calculateRatingAndReviews(
        ratingAndReviews
      );

      await redis?.set(getProductRatingAndReviewsKey(item._id),
        JSON.stringify({
          totalReviews,
          avgRating: avgRating > 0 ? avgRating : 0,
        })
      );

      return {
        ...newItem,
        thumbnail: newItem.thumbnail.url,
        ratingAndReviews: {
          totalReviews,
          avgRating: avgRating > 0 ? avgRating : 0,
        },
      };
    })
  );

  if (rating)
    filteredProducts = filteredProducts.filter(
      (item) => item.ratingAndReviews.avgRating >= intRating
    );

  // if(query) filteredProducts = filteredProducts.filter((item) => {
  //   const {title, description, category:{parent, child}, highlights, specifications} = item;
  //   if(title.includes(query) || description.includes(query) || parent.includes(query) || child.includes(query) || highlights.includes(query)) return true;
  //   return false;
  // });

  return res.status(200).json({
    success: true,
    message: "Products filtered",
    data: {
      products: filteredProducts,
      totalPage:
        filteredProducts.length < 12 ? 1 : Math.ceil(totalItems / intLimit),
      totalResults: totalItems,
    },
  });
});

export const getCategories = TryCatch(async (req, res, next) => {
  const catchedCategories = await redis?.get(productCategoriesKey);

  if (catchedCategories) {
    return res.status(200).json({
      success: true,
      message: "Categories fetched",
      data: JSON.parse(catchedCategories),
    });
  }

  let categories = await Product.find().select("category");

  categories = categories.map((item) => {
    const newItem = JSON.parse(JSON.stringify(item));
    return newItem.category.child;
  });

  let filteredCategories = [...new Set(categories)].map((cat: string) => {
    return {
      name: cat.at(0)?.toUpperCase() + cat.slice(1),
      value: cat,
    };
  });

  await redis?.set(productCategoriesKey, JSON.stringify(filteredCategories));

  return res.status(200).json({
    success: true,
    message: "Categories fetched",
    data: filteredCategories,
  });
}); // redis done

export const getCategoriesWithImage = TryCatch(async (req, res, next) => {
  const catchedCategories = await redis?.get(productCategoriesWithImageKey);

  if (catchedCategories) {
    return res.status(200).json({
      success: true,
      message: "Categories fetched",
      data: JSON.parse(catchedCategories),
    });
  }

  let categories = await CategoriesWithImage.find().limit(6);
  categories = categories
    .map((item: CategoryWithImageType) => {
      return {
        ...item.parent,
        name: makeFirstLetterCap(item.parent.name)
      };
    });

  await redis?.set(productCategoriesWithImageKey, JSON.stringify(categories));

  return res.status(200).json({
    success: true,
    message: "Categories fetched",
    data: categories,
  });
}); // redis done

