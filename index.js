import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


// database
const dbconnect= async () => {
    try {
        const connect_Instance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`mongo db connect !! with host ${connect_Instance.connection.host}`)


        
    } catch (error) {
        console.log("mongodb connection error",error)

        process.exit(1)

        
    }
}

export default dbconnect;