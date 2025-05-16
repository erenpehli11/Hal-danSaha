import express from 'express';
import User from "../Models/UserModel.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";

const router = express.Router();


const createToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '1d'
    });

}    


const LoginUser = async (req, res) => {
    const { email, password } = req.body; // ✅ burada email tanımlanıyor
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Kullanıcı bulunamadı." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Şifre yanlış." });
    }
        

        // JWT oluşturma
        const token = createToken(user._id);
        res.cookie('jwt', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24, // 1 gün
        });

        // Kullanıcı doğrulandıysa Ana Sayfa'ya yönlendir
        res.redirect('/AnaSayfa');
    } catch (error) {
        // Hata durumunda hata mesajını JSON formatında geri döndür
        console.error(error); // Hatanın ayrıntılarını konsola yazdır
        res.status(500).json({ message: "Sunucu hatası." });
    }
};

const renderAnaSayfa = (req, res) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
            if (err) {
                console.error(err);
                res.redirect('/UyeGirisi');
            } else {
                const user = await User.findById(decodedToken.userId);
                res.render('AnaSayfa', { user });
            }
        });
    } else {
        res.redirect('/UyeGirisi');
    }
};

export { LoginUser, renderAnaSayfa };