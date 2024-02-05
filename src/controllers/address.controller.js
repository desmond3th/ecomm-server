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


const updateAddress = asyncHandler(async(req, res) => {

    const{addressId} = req.params;
    const userId = req.user._id;

    const {addressLine1, addressLine2, phoneNumber,
            alternatePhoneNumber, pinCode, city, state, country, landmark} = req.body;
    
    const address = await Address.findByIdAndUpdate(
        {
            _id :addressId,
            owner: userId, 
        },
        {
            $set : {
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
            }     
        }, {new: true}
    )

    if(!address) {
        throw new ApiError(404, "address not found")
    }

    return res.status(200)
    .json(
        new ApiResponse(201, address, "Address updated successfully")
    )
})


const getAdressById = asyncHandler(async (req, res) => {

    const addressId = req.params
    const userId = req.user._id

    const address = await Address.findOne({
        _id: addressId,
        owner: userId
    })

    if(!address) {
        throw new ApiError(404, "address not found")
    }

    return res.status(200)
    .json(
        new ApiResponse(200, address, "Address fetched succesfully")
    )
})


export {addAddress,
        updateAddress,
        getAdressById}
