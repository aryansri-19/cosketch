import mongoose from 'mongoose';

var isConnected = false;
export async function connectToMongoDB() {

    if (!process.env.MONGODB_URI) return console.log("No MONGODB_URL found");

    try {
        if (isConnected) {
            console.log('Already connected to MongoDB');
            return;
        }
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.MONGODB_DB,
            connectTimeoutMS: 10000,
        });
        isConnected = true;
        console.log('Connected to MongoDB');

    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}
