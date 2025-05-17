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
    const { email, password } = req.body; 
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

export const cleanUpDeletedUserReferences = async () => {
  try {
    // Tüm kullanıcı ID'lerini topla
    const existingUsers = await User.find({}, "_id");
    const validUserIds = existingUsers.map((u) => u._id.toString());

    // --- WEEKLY MATCH TEMİZLİĞİ ---
    const matches = await WeeklyMatch.find();

    for (const match of matches) {
      const originalTeam1 = match.team1Players.length;
      const originalTeam2 = match.team2Players.length;

      match.team1Players = match.team1Players.filter(player =>
        validUserIds.includes(player.user?.toString())
      );

      match.team2Players = match.team2Players.filter(player =>
        validUserIds.includes(player.user?.toString())
      );

      if (
        match.team1Players.length !== originalTeam1 ||
        match.team2Players.length !== originalTeam2
      ) {
        await match.save();
        console.log(`WeeklyMatch ${match._id} güncellendi.`);
      }
    }

    // --- LİG ÜYELERİNDEN TEMİZLE ---
    const leagues = await League.find();

    for (const league of leagues) {
      const originalLength = league.members.length;

      league.members = league.members.filter(memberId =>
        validUserIds.includes(memberId.toString())
      );

      if (league.members.length !== originalLength) {
        await league.save();
        console.log(`League ${league._id} üyeleri güncellendi.`);
      }
    }

    // --- KULLANICILARIN GOALS.WEEKLY TEMİZLİĞİ ---
    const users = await User.find();

    for (const user of users) {
      const originalLength = user.goals.weekly.length;

      user.goals.weekly = user.goals.weekly.filter(entry =>
        entry.matchId // matchId'ye göre tutuyoruz, user'a değil ama null check iyi olur
      );

      if (user.goals.weekly.length !== originalLength) {
        await user.save();
        console.log(`User ${user._id} goal weekly verisi güncellendi.`);
      }
    }

    console.log("Tüm silinen kullanıcı referansları temizlendi.");
  } catch (err) {
    console.error("Temizlik işlemi sırasında hata oluştu:", err);
  }
};

export { LoginUser, renderAnaSayfa };