import { Cart } from "../models/cart.model";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getCart = async (userId) => {
    const cart = await Cart.aggregate([
        {
            $match: { owner: userId}
        },
        {
            $unwind: "$items"
        },
        {
            $lookup : {
                from : "products",
                localField : "items.productId",
                foreignField : "_id",
                as: "product"
            }
        },
        {
            $project : {
                product : {$first : "$product"},
                quantity : "$items.quantity",
            }
        },
        {
            $group : {
                _id : "$_id",
                items : {
                    $push : "$$ROOT",
                },
                cartTotal : {
                    $sum : {
                        $multiply : ["product.price", "$quantity"]
                    }
                },
            }
        },
    ])

    return cart[0] ?? {
        _id : null,
        items : [],
        cartTotal: 0
    }

};


const getUserCart = asyncHandler(async(req, res ) => {
    try {
        const cart = await getCart(req.user._id)
        
        return res.status(200)
        .json(
            new ApiResponse(201, cart, "Cart fetched successfully")
        )
    } catch (error) {
        throw new ApiError(400, error.message);
    }
});



export {
    getUserCart,
}