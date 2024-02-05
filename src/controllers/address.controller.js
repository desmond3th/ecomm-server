import { Address } from "../models/address.model";
import { User } from "../models/user.model,js";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addAddress = asyncHandler(async (req, res) => {
    const {addressLine1, addressLine2, phoneNumber,
            alternatePhoneNumber, pinCode, city, state, country, landmark} = req.body;

    const owner = req.user._id

    const address = await Address.create({
        owner,
        addressLine1,
        addressLine2 : addressLine2 || "", 
        phoneNumber,
        alternatePhoneNumber : alternatePhoneNumber || "",
        pinCode, 
        city, 
        state, 
        country, 
        landmark : landmark || "",
    })

    return res.status(200)
    .json(
        new ApiResponse(201, address, "Address added successfully")
    )

})

export {addAddress}
