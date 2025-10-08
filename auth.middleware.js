import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import {user} from "../models/user.model.js"
export const verifyJWT
= asyncHandler(async (req,res,next)=>
{
    // request se hme cookies leni h 
    // usme cookies hmne hi di h accesstoken aur refresh token ki while logging in
   try {
    const token= req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    if(!token)
    {
     throw new apiError(401,"unauthorized request")
 
    }
    const decodedToken= jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
 
    const USER =await user.findById(decodedToken?._id).select("-password -refreshToken")   // _id field was added in the accessToken method in controller 
     
    if(!USER)
    {
 
     // TODO : DISCUSSION ABOUT TOKEN HERE
     throw new apiError(401,"invalid access token")
    }
 
 
    req.USER=USER
    next()
   } catch (error) {
        throw new apiError(401,"invalid access token")
   }


})