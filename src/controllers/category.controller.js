import { Category } from "../models/category.model.js";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const createCategory = asyncHandler(async(req, res) => {

    const {name} = req.body;

    const category = await Category.create({
        name,
        owner: req.user._id,
    })

    if(!category) {
        throw new ApiError(400, "Invalid Request")
    }

    return res.status(200)
    .json(
        new ApiResponse(201, category,"Category created")
    )
})

export {createCategory,}