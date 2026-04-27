import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import router from './Routes/routes.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    // Allow all localhost origins for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('10.0.2.2')) {
      return callback(null, true);
    }
    // Allow Vercel or production domains if known
    return callback(null, true);
  },
  credentials: true
}));


import adminRoutes from './Routes/adminRoutes.js';

app.use('/', router);
app.use('/admin', adminRoutes);

mongoose.connect(
  process.env.MONGODB,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
).then(() => {
  console.log('MongoDB connected succesfully');

  const Port = process.env.PORT || 8000;
  app.listen(Port, () => {
    console.log(`Server started at port: ${Port}`);
  })
})
  .catch((err) => console.log('error', err.message))