import mongoose from 'mongoose';
import 'dotenv/config';

await mongoose.connect(process.env.MONGO_URI);
console.log('Conexión exitosa a MongoDB Atlas');
