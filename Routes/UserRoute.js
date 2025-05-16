import express from "express";
import * as UserControl from '../Controllers/UserControl.js';
import { authenticateToken, checkUser } from "../middlewares/authmiddleware.js";
import User from "../Models/UserModel.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
const router = express.Router();

const verificationCodes = new Map();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "halidansaha@gmail.com",
    pass:  "dbjcoiegcnufkweu" , 
  },
});

const validatePassword = (password) => {
  return /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
};

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 1. Doğrulama kodu gönderme endpoint'i
router.post('/send-verification-code', async (req, res) => {
  try {
    const { name, surname, email, password } = req.body;

    // Zorunlu alan kontrolü yapabilirsin
    if (!name || !surname || !email || !password) {
      return res.status(400).json({ message: "Tüm alanları doldurun." });
    }

    // E-posta benzersizliği kontrolü
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Bu e-posta adresi zaten kullanımda." });
    }

    // Şifre kuralları kontrolü
    if (!validatePassword(password)) {
      return res.status(400).json({ message: "Şifre en az 8 karakter, 1 büyük harf ve 1 sayı içermeli." });
    }

    // Doğrulama kodu oluştur
    const code = generateVerificationCode();

    // Mail gönderimi
    await transporter.sendMail({
      from: "HalidanSaha@gmail.com",
      to: email,
      subject: "Doğrulama Kodu",
      text: `Doğrulama kodunuz: ${code}`,
    });

    // Kod ve kullanıcı bilgilerini geçici hafızada tut
    verificationCodes.set(email, {
      name,
      surname,
      password,
      code,
    });

    res.status(200).json({ message: "Doğrulama kodu e-postanıza gönderildi." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// 2. Kod doğrulama ve kayıt tamamlama endpoint'i
router.post('/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;

    const record = verificationCodes.get(email);
    if (!record) return res.status(400).json({ message: "Doğrulama kodu bulunamadı." });
    if (record.code !== code) return res.status(400).json({ message: "Kod yanlış." });

    // Şifreyi hash'le
    const hashedPassword = await bcrypt.hash(record.password, 10);

    // Yeni kullanıcı oluştur
    const newUser = await User.create({
      name: record.name,
      surname: record.surname,
      email,
      password: hashedPassword,
    });

    // Kod kaydını temizle
    verificationCodes.delete(email);

    res.status(201).json({ message: "Kayıt başarılı. Giriş yapabilirsiniz." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});




















router.post("/UyeGirisi" , UserControl.LoginUser);
router.get('/AnaSayfa', checkUser, (req, res) => {
    res.render('AnaSayfa', { user: res.locals.user });
});

router.get('/CikisYap', (req, res) => {
  // Eğer JWT'yi cookie'de tutuyorsan bunu yap:
  res.clearCookie('token');
  
  // Tarayıcıdan yönlendir
  res.redirect('/UyeGirisi'); // ya da giriş ekranına
});






export default router;