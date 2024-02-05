import { Profile} from "../models/profileModel.js";
import { User } from "../models/userModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const getUserProfile = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const user = User.findById(userId);

    if(!user) {
        throw new ApiError(400, "User profile not found")
    }

    return res.status(200)
    .json(
        new ApiResponse(201, user, "User profile fetched successfully")
    )
})


const updateUserProfile = asyncHandler(async (req, res) => {

    const {firstName, lastName, phoneNumber} = req.body;

    const user = User.findByIdAndUpdate(req.user._id,
        {
            firstName,
            lastName,
            phoneNumber
        },
        {new: true}
    );

    return res.status(200)
    .json(201, user, "User profile updated successfully")
    
})

export { getUserProfile,
        updateUserProfile }