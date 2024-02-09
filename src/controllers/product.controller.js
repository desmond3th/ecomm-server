import {Product} from "../models/product.model.js";
import {Category} from "../models/category.model.js";
import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { cloudinaryUpload, cloudinaryDelete } from "../utils/cloudinary.js";

const addProduct = asyncHandler(async(req, res) => {

    const {name, description, price, category, stock} = req.body

    const getCategory = await Category.findById(category);

    if(!getCategory) {
        throw new ApiError(402, "Category doesn't exist")
    }

    const productImagePath = req.files?.productImage[0].path;

    const productImageUrl = await cloudinaryUpload(productImagePath) 

    if(!productImageUrl) {
        throw new ApiError(400, "Failed to upload product image")
    }

    const product = await Product.create({
        name,
        description,
        price,
        stock,
        productImage: productImageUrl
    })

    return res.status(200)
    .json(
        new ApiResponse(201, product, "Product created successfully")
    )
})

const updateProduct = asyncHandler( async (req, res) => {
    const productId = req.params
    const {name, description, price, stock} = req.body

    const product = await Product.findByIdAndUpdate({
        productId,
        $set :{
            name,
            description,
            stock,
            price
        },
    }, {new:true} )

    if(!product) {
        throw new ApiError(401, "Failed to update product details")
    }

    return res.status(200)
    .json(
        new ApiResponse(201, product, "Product details updated successfully")
    )
})

export {addProduct,
        updateProduct,}