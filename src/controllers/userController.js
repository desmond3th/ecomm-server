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