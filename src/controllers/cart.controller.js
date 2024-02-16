import { Cart } from "../models/cart.model";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getUserCart = asyncHandler(async(req, res ) => {
    const cart = await FindById(req.user._id)

    return res.status(200)
    .json(
        new ApiResponse(201, cart, "Cart fetched successfully")
    )
})
