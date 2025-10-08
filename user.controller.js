import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import {user} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiresponse.js";
import path from "path"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens= async (userID) =>
{
  try {
    const User = await USER.findById(userID)
   const accessToken= User.generateAccessToken() 
    const refreshToken= User.generateRefreshToken()
    
    user.refreshToken= refreshToken
    await user.save({validateBeforeSave: false})

    return { accessToken, refreshToken}


    
  } catch (error) {
    throw new apiError(500,"something went wrong while generating token")
  }
}

const registerUser= asyncHandler(async(req,res)=>{

  console.log("req.file:", req.file);
console.log("req.files:", req.files);

    // taking details from the user 
   const {username,email,fullname,password} =req.body

   // checking validation //

   // using some method of js

   if([username,email,fullname,password].some((field)=> field?.trim()===""))
   {
        throw new apiError(400,"all fields are compulsory")
   }

   // checking if there or not already

   const userexists= await user.findOne({
    $or: [{email},{username}]
   })
    if(userexists) {
        throw new apiError(404,"username or email already exists")
    }


    // now dealing with the images 

    const avatarLocalPath= req.files?.avatar?.[0]?.path 
    // const coverImageLocalPath =req.files?.coverImage[0].path


    let coverImageLocalPath;
if (
  req.files &&
  Array.isArray(req.files.coverImage) &&
  req.files.coverImage.length > 0
) {
  coverImageLocalPath = req.files.coverImage[0].path;
}
    


    if(!avatarLocalPath)
    { throw new apiError(400,"avatar path required ")
    }


    //upload things on cloudinary

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

     if (!avatar) {
  throw new apiError(400, "avatar upload to cloudinary failed");
}


    const USER = await user.create({
  fullname,
  avatar: avatar.url,
  coverImage: coverImage?.url || "",
  email,
  password,
  username: username.toLowerCase()
})
    
     // now unlinking the password and refreshtoken

    const createdUser = await user.findById(USER._id).select( "-password -refreshToken")


    if(!createdUser)
    {
        throw new apiError(500,"something went wrong while registering")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser, " user registered successfully ")
    )

})

const loginUser = asyncHandler( async (req,res)=>{
  // fetching detials from the user 
  const {username, password} =req.body

  if(!username)
  {
    throw new apiError(400," username required")

  }

  // finding user in the databse 
  const USER = await user.findOne({username})

  if(!USER)
  {
    throw new apiError(404,"user doesn't exist")

  }

  // check for password 
  // using bcrypt

  const isPassValid =await USER.isPasswordCorrect(password)
  
  if(!isPassValid)
  {
    throw new apiError(404,"wrong password ")

  }

  // now time for access and refresh token 
  // since it has to be used frequenlty 
  // we can make a separate method for this 

  const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(USER._id)


  const loggedInUser = await user.findById(USER._id).select("-password -refreshToken")

  const options =
  {
    httpOnly : true,
    secure: true
  }

  return res
  .status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(
    new ApiResponse(
      200,
      {
        user: loggedInUser,accessToken,refreshToken
      },
      "user loggen in successfully"
    )
  )
})

const logoutUser = asyncHandler(async (req,res)=>{
  
  await user.findByIdAndUpdate(
    req.USER._id,
    {
      $set:{
        refreshToken:undefined
      }
    },
    {
      new:true
    }
  )
  const options =
  {
    httpOnly : true,
    secure: true
  }

  return res.status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new ApiResponse(200,{},"user logged out"))
  
})


const refreshAccessToken = asyncHandler (async (req,res)=>{


    const incomingRefreshToken= req.cookies.refreshToken|| req.body.refreshToken
    if(!incomingRefreshToken)
    {
      throw new apiError(404,"refresh token invalid")
    }

    // verifying token here 

    const decodedToken= jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    )

    const USER= user.findById(decodedToken?._id)

    if(!USER)
    {
      throw new apiError(404,"refresh token invalid")
    }

    if(incomingRefreshToken!== USER?.refreshToken)
    {
      throw new apiError(404,"refresh token expired")
    }

    // generating new refresh token

    const options=
    {
      httpOnly:true,
      secure:true
    }

    const {accessToken , new_refreshToken }=await generateAccessAndRefreshTokens(USER._id)

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",new_refreshToken,options)
    .json(
      new ApiResponse(
        200,
        {
          accessToken,
          refreshToken : new_refreshToken

        },
        "access token refreshed "
      )
    )
})
export {registerUser, loginUser, logoutUser,refreshAccessToken }