import mongoose from "mongoose";
import dotenv from "dotenv";
import WeeklyMatch from "../Models/WeeklyMatch.js";
import User from "../Models/UserModel.js";

dotenv.config();
const DB_URI = process.env.DB_URI;

async function cleanUpWeeklyMatches() {
  await mongoose.connect(DB_URI);
  console.log("✅ MongoDB bağlantısı başarılı.");

  const matches = await WeeklyMatch.find({});

  for (const match of matches) {
    let updated = false;

    // ✅ team1Players temizleme
    const cleanedTeam1 = [];
    for (const p of match.team1Players) {
      const exists = await User.exists({ _id: p.user });
      if (exists) cleanedTeam1.push(p);
    }
    if (cleanedTeam1.length !== match.team1Players.length) {
      match.team1Players = cleanedTeam1;
      updated = true;
    }

    // ✅ team2Players temizleme
    const cleanedTeam2 = [];
    for (const p of match.team2Players) {
      const exists = await User.exists({ _id: p.user });
      if (exists) cleanedTeam2.push(p);
    }
    if (cleanedTeam2.length !== match.team2Players.length) {
      match.team2Players = cleanedTeam2;
      updated = true;
    }

    // ✅ goals temizleme
    const cleanedGoals = [];
    for (const g of match.goals) {
      const exists = await User.exists({ _id: g.scorer });
      if (exists) cleanedGoals.push(g);
    }
    if (cleanedGoals.length !== match.goals.length) {
      match.goals = cleanedGoals;
      updated = true;
    }

    if (updated) {
      await match.save();
      console.log(`🧹 WeeklyMatch ${match._id} temizlendi (silinmiş kullanıcılar çıkarıldı).`);
    }
  }

  await mongoose.disconnect();
  console.log("🔌 MongoDB bağlantısı kapatıldı.");
}

cleanUpWeeklyMatches().catch(console.error);