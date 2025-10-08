import mongoose,{Schema} from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema= new Schema({
    username:
    {
        type: String,
        required: true,
        unique:true,
        lowercase: true,
        trim: true,
        index: true
    },
    email:
    {
        type: String,
        required: true,
        unique:true,
        lowercase: true,
        trim: true,
        
    },
    fullname:{
        type: String,
        required: true,
       
        trim: true,
        index: true
    },
    avatar:
    {
        type:String,
        // coudinary url

        required: true
    },
    coverImage:
    {
        type: String
    },
    watchHistory:
    [
        {
            type:Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password:
    {
        type: String,
        required: [true,'password is required']

    },
    refreshToken:{
        type:String
    }

},
{
    timestamps:true
})

//  this this pre hook 
// this will encrypt the password whnever changes or password is saved 
userSchema.pre("save",async function(next) {
    if(!this.isModified("password")) return next()


    this.password= await bcrypt.hash(this.password,10)
    next()
})

// this is method made by us 
// to check whether the encrypted password matchs the user one
userSchema.methods.isPasswordCorrect= async function (password)
{
  return  await    bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken= function()
{
   return JsonWebTokenError.sign(
        {
            _id : this._id,
            email: this.email,
            username: this.username,
            fullname:this.fullname
        },

        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_SECRET
        }
    )
}

userSchema.methods.generateRefreshToken= function(){
    return JsonWebTokenError.sign(
        {
            _id : this._id,
            
        },

        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_SECRET
        }
    )
}

export const user =mongoose.model("user",userSchema)