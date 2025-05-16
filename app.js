import express from 'express';
import dotenv from "dotenv";
import conn from './db.js';
import cookieParser from 'cookie-parser';
import pageRoute from './Routes/pageRoute.js';
import UserRoute from './Routes/UserRoute.js';
import { checkUser } from "./middlewares/authmiddleware.js"
import leagueRoute from "./Routes/LeagueRoute.js";
import UserRoutes from './Routes/UserRoute.js';

import { authenticateToken } from "./middlewares/authmiddleware.js"

dotenv.config();
conn();


const app = express()
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.set('view engine' , 'ejs');

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(express.static('public'));

app.use('/', UserRoutes);
app.use(authenticateToken);
app.use("*" , checkUser);
app.use('/' , pageRoute);
app.use('/' , leagueRoute);
app.use('/UyeOl', pageRoute);
app.use('/UyeGirisi' , pageRoute);
app.use('/UyeOlundu', pageRoute);
app.post('/UyeGirisi', UserRoute);
app.use('/AnaSayfa',pageRoute);
app.use('/LigOlustur', pageRoute);
app.post('LigOlustur', leagueRoute);
app.use('/LigeKatil', pageRoute);
app.use('/Lig/:id' , pageRoute)




app.listen(port, ()=> {
    console.log('Application running on port:' + port);
});
