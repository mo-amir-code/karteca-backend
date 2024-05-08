import { TryCatch } from "../middlewares/error.js";
import Admin from "../models/Admin.js";
import CategoriesWithImage from "../models/CategoriesWithImage.js";
import Product from "../models/Product.js";
import TxnVerifyRequest from "../models/TxnVerifyRequest.js";
import User from "../models/User.js";
import WithdrawalRequest from "../models/WithdrawalRequest.js";
import { ChildCategoryType, ChildCreateCategoryType, CreateCategoryType, CreateProductType } from "../types/admin.js";
import { deleteImageOnCloudinary, uploadImageOnCloudinary } from "../utils/uploadOnCloudinary.js";
import ErrorHandler from "../utils/utility-class.js";


export const fetchTransactionRequests = TryCatch( async (req, res, next) => {

    let txns = await TxnVerifyRequest.find({ status: { $in: ["pending", "processing"] } }).populate({
        path: "userId",
        select: "name phone"
    });


    txns = txns.map((txn) => {
        return {
            _id: txn._id,
            name: txn.userId.name,
            amount: txn.amount,
            phone: txn.userId.phone,
            utrId: txn.utrId,
            status: txn.status,
            type: txn.type
        }
    });



    return res.status(200).json({
        success: true,
        message: "Transaction requests fetched",
        data: txns
    });

});

export const fetchWithdrawalRequests = TryCatch( async (req, res, next) => {

    let withdrawalRequests = await WithdrawalRequest.find({ status: { $in: ["pending", "processing"] } }).populate({
        path: "userId",
        select: "name phone"
    });


    withdrawalRequests = withdrawalRequests.map((wtwl) => {
        return {
            _id: wtwl?._id,
            name: wtwl?.userId.name,
            amount: wtwl?.amount,
            phone: wtwl?.userId?.phone,
            upiId: wtwl?.to?.upi,
            status: wtwl?.status
        }
    });



    return res.status(200).json({
        success: true,
        message: "Withdrawal requests fetched",
        data: withdrawalRequests
    });

});

export const fetchUserCount = TryCatch(async (req, res, next) => {

    const count = await User.countDocuments();

    return res.status(200).json({
        success: true,
        message: "User counts seccessfully",
        data: count
    })

});

export const createProduct = TryCatch(async (req, res, next) => {
    const data = req.body as CreateProductType;

    await Product.create(data);

    return res.status(200).json({
        success: true,
        message: "Product created"
    });
});

export const fetchProductCategory = TryCatch(async (req, res, next) => {
    const { parentCategory } = req.query;

    let parentCategories = await CategoriesWithImage.find().select("parent.name");
        parentCategories = parentCategories.map((ctry) => {
            return ctry.parent.name;
        });

    let childCategories = [];
    if(parentCategory){
        childCategories = await CategoriesWithImage.find({ "parent.name":parentCategory });
        childCategories = childCategories?.map((ctry) => {
            return ctry?.childs?.map((child:ChildCategoryType) =>{
                return child.name; 
            })
        })[0];
    }

    return res.status(200).json({
        success: true,
        message: "Categories fetched",
        data:{
            parentCategories,
            childCategories
        }
    });

});

export const uploadImage = TryCatch(async (req, res, next) => {
    const { url, public_id } = await uploadImageOnCloudinary(req.body.imageToUpload);

    return res.status(200).json({
        success: true,
        message: "Image uploaded successfully",
        data: {
            imageUrl: url,
            publicId: public_id
        }
    })
});

export const deleteImage = TryCatch(async (req, res, next) => {
    const {publicId} = req.body;

    console.log(publicId)
    
    const isDeleted = await deleteImageOnCloudinary(publicId);
    
    console.log(isDeleted)

    if(!isDeleted){
        return next(new ErrorHandler("Something weng wrong!", 400));
    }

    return res.status(200).json({
        success: true,
        message: "Image has been deleted"
    })
});

export const createCategory = TryCatch(async (req, res, next) => {
    const { parentName, parentImage } = req.body as CreateCategoryType;

    if(!parentName || !parentImage){
        return next(new ErrorHandler("Required fields is/are empty", 400));
    }

    const category = await CategoriesWithImage.findOne({ "parent.name":parentName.toLowerCase() });

    if(category){
        return res.status(409).json({
            success: true,
            message: "Category is already exist"
        });
    }

    await CategoriesWithImage.create({
        parent:{
            name:parentName.toLowerCase(),
            image: parentImage.url,
            publicId: parentImage.publicId
        }
    });
    

    return res.status(200).json({
        success: true,
        message: "Category created"
    });

    
});

export const createChildCategory = TryCatch(async (req, res, next) => {
    const { childImage, childName, parentName } = req.body as ChildCreateCategoryType;

    if(!childName || !childImage || !parentName){
        return next(new ErrorHandler("Required fields is/are empty", 400));
    }

    const category = await CategoriesWithImage.findOne({ "parent.name":parentName.toLowerCase() });

    if(!category){
        return res.status(400).json({
            success: true,
            message: "Parent category not found"
        });
    }

    const isChildCategoryExist = category.childs.find((child:any) => child.name.toString() === childName.toString().toLowerCase())

    if(isChildCategoryExist){
        return res.status(409).json({
            success: true,
            message: "Child category is already exist"
        });
    }    

    category.childs.push({
        name: childName.toLowerCase(),
        image: childImage.url,
        publicId: childImage.publicId
    });
    await category.save();

    return res.status(200).json({
        success: true,
        message: "Child category created"
    });
});

export const createAdmin = TryCatch(async (req, res, next) => {
    const {email, upi} = req.body;

    if(!email || !upi){
        return next(new ErrorHandler("Required field is missing", 400));
    }

    const user = await User.findOne({email});
    const isAdminExist = await Admin.findOne({ userId:user._id });

    if(user.role === "admin" && isAdminExist){
        return res.status(304).json({
            success: false,
            message: "User already a admin"
        });
    }

    user.role = "admin";
    await Admin.create({
        userId:user._id,
        upi:{
            upiId: upi,
            isActive: false
        }
    });
    await user.save();

    return res.status(200).json({
        success: true,
        message: "Admin created"
    });
});

export const activeUpi = TryCatch(async (req, res, next) => {
    const {userId} = req.body;

    if(!userId){
        return next(new ErrorHandler("Required field is missing", 400));
    }

    const admin = await Admin.findOne({userId});

    if(!admin){
        return next(new ErrorHandler("Admin not found", 401));
    }

    await Admin.updateMany({
        "upi.isActive":false
    });

    admin.upi.isActive = true;
    await admin.save();

    return res.status(200).json({
        success: true,
        message: `UPI ${admin.upi.upiId} activated to collect payment`
    });

});

export const getAdminUpis = TryCatch(async (req, res, next) => {
    let upis = await Admin.find().populate({
        path: "userId",
        select: "name _id"
    });

    upis = upis.map((upi) => {
        return {
            adminId: upi.userId._id,
            name:upi.userId.name,
            upi:upi.upi.upiId,
            isActive: upi.upi.isActive
        }
    });

    return res.status(200).json({
        success: true,
        message: "fetched",
        data:upis
    });
})