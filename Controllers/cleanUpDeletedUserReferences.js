import mongoose from "mongoose";
import dotenv from "dotenv";
import WeeklyMatch from "../Models/WeeklyMatch.js";
import League from "../Models/LeagueModel.js";
import User from "../Models/UserModel.js";

dotenv.config();

const DB_URI = process.env.DB_URI;
console.log("🧼 cleanUpDeletedUserReferences.js çalışmaya başladı...");

async function cleanUpDeletedUserReferences() {
  console.log("🔌 MongoDB bağlantısı kuruluyor...");

  try {
    await mongoose.connect(DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB bağlantısı başarılı.");

    // 1. WeeklyMatch oyuncularını temizle
    console.log("🟡 [Adım 1] WeeklyMatch'lerdeki silinmiş oyuncular temizleniyor...");
    const matches = await WeeklyMatch.find({});
    for (const match of matches) {
      const originalPlayerCount = match.players.length;
      match.players = match.players.filter(player => player.user); // `user` populated değilse referans yok demek
      if (match.players.length !== originalPlayerCount) {
        await match.save();
        console.log(`🔧 WeeklyMatch (${match._id}) güncellendi, silinmiş oyuncular kaldırıldı.`);
      }
    }

    // 2. League üyelerini temizle
    console.log("🟡 [Adım 2] League üyeleri kontrol ediliyor...");
    const leagues = await League.find({});
    for (const league of leagues) {
      const originalCount = league.members.length;
      const updatedMembers = [];

      for (const memberId of league.members) {
        const userExists = await User.exists({ _id: memberId });
        if (userExists) {
          updatedMembers.push(memberId);
        } else {
          console.log(`🧹 Silinmiş kullanıcı ${memberId} -> Lig '${league.name}' üyeliğinden çıkarıldı.`);
        }
      }

      if (updatedMembers.length !== originalCount) {
        league.members = updatedMembers;
        await league.save();
        console.log(`🔧 League (${league.name}) üyeleri güncellendi.`);
      }
    }

    // 3. User içindeki goals.weekly -> matchId veya user silinmiş mi kontrol
    console.log("🟡 [Adım 3] Kullanıcıların goals.weekly kayıtları kontrol ediliyor...");
    const users = await User.find({});
    for (const user of users) {
      const originalGoals = user.goals.weekly.length;
      user.goals.weekly = user.goals.weekly.filter(g => g.matchId); // Eğer matchId silindiyse referans bozulur
      if (user.goals.weekly.length !== originalGoals) {
        await user.save();
        console.log(`🔧 User (${user.name}) weekly goal istatistikleri güncellendi.`);
      }
    }

    console.log("🎉 Tüm temizlik işlemleri tamamlandı.");
  } catch (err) {
    console.error("❌ Hata oluştu:", err);
  } finally {
    setTimeout(() => {
      mongoose.disconnect();
      console.log("🔌 MongoDB bağlantısı kapatıldı.");
    }, 1000); // İşlemlerin tamamlandığından emin olmak için küçük gecikme
  }
}

cleanUpDeletedUserReferences();