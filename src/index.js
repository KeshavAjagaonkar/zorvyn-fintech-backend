import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import authroutes from './routes/auth.routes.js';


const app = express();

app.use(cors());

app.use(express.json());
app.use('/auth', authroutes);



const PORT  = process.env.PORT || 3000;
app.listen(PORT , () => {
    console.log(`server listening on the port number ${PORT}`);
})