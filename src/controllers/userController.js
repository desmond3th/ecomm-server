import { asyncHandler } from "../utils/asyncHandler.js"; 
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {cloudinaryUpload, cloudinaryDelete} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";


const registerUser = asyncHandler(async(req, res) => {
    const {username, email, fullname, password} = req.body;

    const fields = [username, email, fullname, password]

    for(const field in fields) {
        if(!field || !fields.trim()) {
            throw new ApiError(400, "Null or empty field")
        }
    }

    const checkForExistingUserByEmail = await User.findOne(email)
    const checkForExistingUserByUsername = await User.findOne(username)

    if(checkForExistingUserByEmail || checkForExistingUserByUsername) {
        throw new ApiError(405, "User already exists")
    }

    const avatarPath = req.files?.avatar[0]?.path

    if(!avatarPath) {
        throw new ApiError(402, "avatar not found")
    }

    const avatarUrl = await cloudinaryUpload(avatarPath)

    if(!avatarUrl) { 
        throw new ApiError(400, "Error uploading avatar")
    }

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    const coverImageUrl = await cloudinaryUpload(coverImageLocalPath)

    const user = await User.create({
        fullname,
        email,
        username : username.lowercase(),
        password,
        avatarUrl : avatarUrl.url,
        coverImage : coverImageUrl.url || ""
    })

    const findUser = await User.findById(user._id)
    .select("-password -refreshToken")

    if(!findUser) {
        throw new ApiError(400, "couldn't register user")
    }

    return res.status(200)
    .json(
        new ApiResponse(200, findUser, "User registered successfully")
    )
})


const generateAccessAndRefreshTokens =  async (userId) => {

    try {
            const user = await User.findById(userId)
            const accessToken = await user.generateAccessToken()
            const refreshToken = await user.generateRefreshToken()
        
            user.refreshToken = refreshToken
        
            await user.save({validateBeforeSave : false})
        
            return {refreshToken, accessToken}
    } catch (error) {
        throw new ApiError(400, "couldn't generate access and refresh tokens")
    }
    
}

const loginUser = asyncHandler(async (req, res) => {

    const {email, username, password} = req.body

    if(!email && !username) {
        throw new ApiError(401, "email or username required")
    }

    const user = await User.findOne({
        $or : [{email}, {username}]
    })

    if(!user) {
        throw new ApiError(401, "user doesn't exist")
    }

    const checkForPassword = await user.isPasswordCorrect(password)

    if(!checkForPassword) {
        throw new ApiError(401, "password is incorrect")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const userLoggedIn = await User.findById(user._id)
    .select("-password -refreshToken")

    const options = {
        httpOnly : true,
        secure : true
    }

    return res.status(200)
    .cookie("access_token", accessToken, options)
    .cookie("refresh_token", refreshToken, options)
    .json(
        new ApiResponse(202,
            {user: userLoggedIn, accessToken, refreshToken},
            "User logged In successfully")
    )

})


const logoutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(req.user._id,
        {
            $unset: {
                refreshToken: 1,
            }
        },
        {
            new : true,
        }
    )

    const options = {
        httpOnly : true,
        secure : true
    }

    return res.status(200)
    .cookie("access_token", options)
    .cookie("refresh_token", options)
    .json(
        new ApiResponse(200, {} , "user logged out successfully")
    )
})


const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken = req.body.refreshToken || req.cookie.refreshToken

    if(!incomingRefreshToken) {
        throw new ApiError(400, "Invalid Request")
    }

    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decodedToken?._id)

    if(!user) {
        throw new ApiError(400, "Refresh token Invalid")
    }

    if(user?.refreshToken !== incomingRefreshToken) {
        throw new ApiError(400, "Refresh token Invalid or expired")
    }

    const {refreshToken, accessToken} = await generateAccessAndRefreshTokens(user._id)

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .cookie("access_token", accessToken, options)
    .cookie("refresh_token", refreshToken, options)
    .json(
        new ApiResponse(200, 
            {accessToken, refreshToken},
            "Access token refresed successfully")
        )
})


const getCurrentUser = asyncHandler(async (req, res) => {

    return res.status(200)
    .json(200, req.user , "User fetched successfully")
})


const changePassword = asyncHandler(async (req, res) => {
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(user._id)
    const checkForPassword = await user.isPasswordCorrect(oldPassword)

    if(!checkForPassword) {
        throw new ApiError(200, "Password Incorrect")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res.status(200)
    .json(
        new ApiResponse(200, {}, "Password Changed Successfully")
    )
})


const updateUserDetails = asyncHandler(async (req, res) => {
    const {email, fullname} = req.body

    if(!email && !fullname) {
        throw new ApiError(400, "One of the field is required fot updation")
    }

    const user = await User.findByIdAndUpdate(req.user._id, 
        {
            $set : {
                email,
                fullname
            }
        },
        {new: true})
        .select("-password")

    return res.status(200)
    .json(
        new ApiResponse(200, user, "User details updated successfully")
    )
})


const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarPath = req.file?.path

    if(!avatarPath) {
        throw new ApiError(400, "No avatar path provided")
    }

    const avatar = await cloudinaryUpload(avatarPath)

    if(!avatar.url) {
        throw new ApiError(400, "Failed to upload avatar")
    }

    const oldAvatarUrl = req.user.avatar

    const deleteOldAvatar = await cloudinaryDelete(oldAvatarUrl)

    if(!deleteOldAvatar) {
        throw new ApiError(400, "Failed to delete old avatar" )
    }

    const user = await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                avatar : avatar.url
            }
        }, {new: true})
        .select("-password")

    return res.status(200)
    .json(
        new ApiResponse(200, user, "Avatar Updatad Successfully")
    )
})


const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImagepath = req.file?.coverImage

    if(!coverImagepath) {
        throw new ApiError(400, "COver Image path required" )
    }

    const coverImage = await cloudinaryUpload(coverImagepath)

    if(!coverImage.url) {
        throw new ApiError(400, "Cover Image uploading failed" )
    }

    const oldCoverImagePath = req.user?.coverImage

    const deleteOldCoverImage = await cloudinaryUpload(oldCoverImagePath)

    if(!deleteOldCoverImage.url) {
        throw new ApiError(400, "Cover Image deletion failed" )
    }

    const user = await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        }, {new:true})
        .select("-password")

    return res.status(200)
    .json(
        new ApiResponse(200, user, "Cover Image Updated Successfully")
    )
})


export { registerUser,
        loginUser,
        logoutUser,
        refreshAccessToken,
        getCurrentUser,
        changePassword,
        updateUserDetails,
        updateUserAvatar,
        updateUserCoverImage }