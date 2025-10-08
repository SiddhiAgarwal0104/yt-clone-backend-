import mongoose,{Schema, SchemaType} from "mongoose"

const subscriptionSchema= new Schema (
    {
        subscriber :
        {
            type: Schema.Types.ObjectId,
            ref: "user"
        },
        channel:
        {
            type: Schema.Types.ObjectId,
            ref: "user"
        }
    },{timestamps}
)

export const Subscription = mongoose.model("Subscription",subscriptionSchema)