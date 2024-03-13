import { connectToMongoDB } from "../database/mongoose";
import { UserModel } from "../models/user.model";

type userData = {
    name: string,
    email: string,
    image?: string,
    roomId?: string,
}
export const insertUser = async (data: userData) => {
    try {
        await connectToMongoDB();
        const existingUser = await UserModel.findOne({
            email: data.email
        });
        if (existingUser) {
            return existingUser._id;
        }
        const user = new UserModel(data);
        user.save();
        return user._id;
    } catch (error) {
        console.log(error);
    }
}