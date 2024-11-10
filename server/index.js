import express from 'express';
import dotenv from 'dotenv';

import { connectDb } from './db/connectDb.js';

import authRoutes from './routes/auth.routes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use("/api/auth",authRoutes);

app.listen(port, () => {
    connectDb();
    console.log('Auth service listening on port 3001');
});