import mongoose from 'mongoose';
import League from '../Models/LeagueModel.js';
import User from '../Models/UserModel.js';
import Match from '../Models/MatchModel.js';
import WeeklyMatch from '../Models/WeeklyMatch.js';


const getIndexPage = (req,res) => {
    res.render("index");
};

const getUyeGirisiPage = (req, res) => {
    res.render("UyeGirisi");
};

const getUyeOlPage = (req, res) => {
    res.render("UyeOl");
};

const getUyeOlunduPage = (req, res) => {
    res.render("UyeOlundu");
};

const getAnaSayfaPage = (req, res) => {
    res.render("AnaSayfa");
};

const getLigOlusturPage = (req, res) => {
    res.render("LigOlustur");
};

const getLigeKatilPage = (req, res) => {
    res.render("LigeKatil");
};

const getLiglerimPage = async (req, res) => {
    try {
        // Kullanıcı bilgilerini alalım
        const userId = req.user.userId;  // JWT token'dan kullanıcı bilgileri alınıyor

        // Kullanıcının katıldığı ligleri alalım
        const ligler = await League.find({
            members: userId  // Veritabanında üyeleri arıyoruz
        }).populate('admin').populate('members');

        // Eğer ligler bulunursa
        if (ligler && ligler.length > 0) {
            // Veritabanından alınan ligleri şablona gönderiyoruz
            res.render("Liglerim", { ligler: ligler });
        } else {
            res.render("Liglerim", { ligler: [] });  // Eğer hiç lig yoksa
        }

    } catch (err) {
        console.error(err);
        res.status(500).send("Sunucu hatası");
    }
};

const getLeagueDetails = async (req, res) => {
  try {
    const userId = req.user.userId;
    const leagueId = req.params.id;

    // Lig ve maç verilerini getir
    const weeklyMatchList = await WeeklyMatch.find({ league: leagueId });

    const lig = await League.findById(leagueId)
      .populate("admin", "name surname")
      .populate("members", "name surname goals wins")
      .lean();

    if (!lig) {
      return res.status(404).send("Lig bulunamadı.");
    }

    // --- WINNER İSTATİSTİKLERİ ---
    const winnerStats = lig.members.map(user => {
      const userWeeklyMatches = weeklyMatchList.filter(match =>
        [...match.team1Players, ...match.team2Players].some(p => p.user?.toString() === user._id.toString())
      );

      const wins = user.wins || 0;
      const matchCount = userWeeklyMatches.length;
      const winRate = matchCount > 0 ? (wins / matchCount * 100).toFixed(1) : "0.0";

      return {
        name: user.name,
        wins,
        matchCount,
        winRate: parseFloat(winRate)
      };
    }).sort((a, b) => b.wins - a.wins);


    // --- GOL İSTATİSTİKLERİ ---
    const goalStats = lig.members.map(user => {
      const userWeeklyGoals = user.goals?.weekly?.filter(g =>
        weeklyMatchList.some(match => match._id.toString() === g.matchId?.toString())
      ) || [];

      const totalGoals = userWeeklyGoals.reduce((acc, g) => acc + (g.goals || 0), 0);
      const totalMatches = userWeeklyGoals.length;
      const avgGoals = totalMatches > 0 ? (totalGoals / totalMatches).toFixed(2) : "0.00";

      return {
        name: user.name,
        totalGoals,
        totalMatches,
        avgGoals: parseFloat(avgGoals)
      };
    }).sort((a, b) => b.totalGoals - a.totalGoals);
   // En çok gol atan ilk 7 oyuncu

    // --- HAFTANIN MAÇI ---
    const weeklyMatch = await WeeklyMatch.findOne({ league: leagueId })
      .populate('team1Players.user')
      .populate('team2Players.user')
      .sort({ date: -1 });

    // --- SAYFAYI GÖNDER ---
    res.render("LigDetaylari", {
      lig,
      weeklyMatchList,
      weeklyMatch: weeklyMatch || null,
      user: req.user,
      userId,
      goalStats,
      winnerStats,
      message: weeklyMatch ? null : "Bu haftaki maç bilgileri henüz yayınlanmadı."
    });

  } catch (error) {
    console.log("Hata:", error);
    res.status(500).send("Sunucu hatası.");
  }
};

const getAddMatchPage = async (req, res) => {
    const leagueId = req.params.id
    const lig = await League.findById(leagueId).populate('members');

    res.render('MacEkle', { lig });
};

// Maç ekleme işlemini gerçekleştiren controller
const createMatch = async (req, res) => {
    const { team1Players, team2Players, positions1, positions2 } = req.body; // Formdan gelen verileri alıyoruz
    const ligId = req.params.id;
  
    try {
      // Lig bilgisini alalım
      const league = await League.findById(ligId);
      if (!league) {
        return res.status(404).send('Lig bulunamadı.');
      }
  
      // Team1 oyuncuları için ID'leri ve pozisyonları bulalım
      const team1PlayerObjects = [];
      for (let i = 0; i < team1Players.length; i++) {
        let user = await User.findOne({ name: team1Players[i] });
        
        if (!user) {
          // Veritabanında bulunmayan oyuncu, yeni olarak ekleniyor
          user = await User.create({
            name: team1Players[i], // Veritabanında oyuncuyu isimle ekle
          });
        }
  
        team1PlayerObjects.push({
          user: user._id,
          position: positions1[i],  // Pozisyonu ekle
        });
      }
  
      // Team2 oyuncuları için ID'leri ve pozisyonları bulalım
      const team2PlayerObjects = [];
      for (let i = 0; i < team2Players.length; i++) {
        let user = await User.findOne({ name: team2Players[i] });
        
        if (!user) {
          // Veritabanında bulunmayan oyuncu, yeni olarak ekleniyor
          user = await User.create({
            name: team2Players[i], // Veritabanında oyuncuyu isimle ekle
          });
        }
  
        team2PlayerObjects.push({
          user: user._id,
          position: positions2[i],  // Pozisyonu ekle
        });
      }
  
      // WeeklyMatch verisini oluştur
      const weeklyMatch = new WeeklyMatch({
        league: league._id,
        team1Players: team1PlayerObjects,
        team2Players: team2PlayerObjects,
        matchDate: new Date(),
      });
  
      // WeeklyMatch'i kaydet
      await weeklyMatch.save();
  
      // Maç sayfasına yönlendir
      res.redirect(`/lig/${ligId}/fikstur`);
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Bir hata oluştu.');
    }
  };

  const getMatchDetails = async (req, res) => {
    try {
      const matchId = req.params.matchId;
  
      const weeklyMatch = await WeeklyMatch.findById(matchId)
        .populate('team1Players.user')
        .populate('team2Players.user')
        .populate('goals.scorer'); // Gol atan oyuncuların bilgilerini doldurur
  
      if (!weeklyMatch) {
        return res.status(404).send('Maç bulunamadı');
      }
  
      res.render('MacDetaylari', { weeklyMatch });
  
    } catch (error) {
      console.log('Maç detayları alınırken hata oluştu:', error);
      res.status(500).send('Bir hata oluştu.');
    }
  };





export {getIndexPage , getLiglerimPage , getMatchDetails , getAddMatchPage , createMatch ,  getUyeGirisiPage , getLeagueDetails ,getUyeOlPage , getUyeOlunduPage , getAnaSayfaPage ,  getLigOlusturPage , getLigeKatilPage};