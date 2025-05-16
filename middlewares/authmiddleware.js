import User from "../Models/UserModel.js";
import jwt from  'jsonwebtoken';


const authenticateToken = (req, res, next) => {
    const token = req.cookies.jwt;

    const publicPaths = ['/UyeGirisi', '/UyeOl', '/'];
    if (publicPaths.includes(req.path)) {
        return next();
    }

    if (!token) {
        return res.redirect('/UyeGirisi');
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
        if (err) {
            console.log("JWT doğrulama hatası:", err.message);
            return res.redirect('/UyeGirisi');
        } else {
            console.log("Decoded token:", decodedToken);
            req.user = decodedToken;  // Burada decodedToken'ı req.user'a atıyoruz
            next();
        }
    });
};

const checkUser = async (req, res , next) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.locals.user = null;
                next();
            }
            else {
                const user = await User.findById(decodedToken.userId);
                res.locals.user = user;
                next();
            }
        });
    }
    else {
        res.locals.user = null
                next();
    }
};
    







export { authenticateToken , checkUser};