import League from '../Models/LeagueModel.js';
import User from '../Models/UserModel.js';
import WeeklyMatch from '../Models/WeeklyMatch.js'
import mongoose from 'mongoose';

const createLeague = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.userId;

        if (!userId) {
            throw new Error("User ID is not defined.");
        }

        // Lig oluşturma kontrolü (örnek: aynı isimde lig varsa hata ver)
        const existingLeague = await League.findOne({ name, admin: userId });
        if (existingLeague) {
            return res.render('LigOlustur', {
                user: req.user,
                errorMessage: 'Bu isimde bir lig mevcut.'
            });
        }

        // Yeni lig oluştur
        const newLeague = await League.create({
            name,
            admin: userId,
            members: [userId]
        });

        // Kullanıcıya lig id ekle
        const user = await User.findById(userId);
        user.leagues.push(newLeague._id);
        await user.save();

        
        return res.render('LigOlustur', {
            user: req.user,
            successMessage: 'Lig başarıyla oluşturuldu!'
        });

    } catch (error) {
        console.error("Hata oluştu:", error.message);

        // Hata durumunda aynı sayfaya errorMessage ile geri dön
        res.render('LigOlustur', {
            user: req.user,
            errorMessage: 'Bir hata oluştu, lütfen tekrar deneyin.'
        });
    }
};

const joinLeague = async (req, res) => {
    try {
        const { name } = req.body; // Kullanıcıdan gelen lig adı
        const userId = req.user.userId; // Kimlik doğrulama ile gelen kullanıcı ID'si

        if (!name) {
            return res.status(400).json({ message: 'Lig adı gereklidir.' });
        }

        // Lig var mı kontrol et
        const league = await League.findOne({ name: name });

        if (!league) {
            return res.render('LigeKatil', {
                user: req.user,
                errorMessage: 'Bu isimde bir lig bulunamadı.'
            });
        }

        // Kullanıcıyı lig üyeleri arasına ekle
        if (league.members.includes(userId)) {
           return res.render('LigeKatil', {
                user: req.user,
                errorMessage: 'Zaten bu lige katıldınız.'
            });
        }

        // Kullanıcıyı lig üyelerine ekle
        league.members.push(userId);

        // Kullanıcıyı lig listesine ekle (User modelindeki leagues array'ine ekleyelim)
        const user = await User.findById(userId);
        user.leagues.push(league._id);

        // Hem kullanıcıyı hem de ligi kaydedelim
        await user.save();
        await league.save();

         return res.render('LigeKatil', {
            user: req.user,
            successMessage: 'Başarıyla lige katıldınız!'
        });
    } catch (error) {
        console.error('Hata oluştu:', error.message);
          return res.render('LigeKatil', {
            user: req.user,
            errorMessage: 'Bir hata oluştu, lütfen tekrar deneyin.'
        });
    }
};


const createMatch = async (req, res) => {
    const { team1Players, team2Players } = req.body; // Formdan gelen verileri alıyoruz
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
        const fullName = team1Players[i]; // Örn: "Ahmet Yılmaz"
        const [name, ...surnameParts] = fullName.trim().split(" ");
        const surname = surnameParts.join(" "); // Birden fazla soyisim varsa da çalışsın
      
        let user = await User.findOne({ name: name, surname: surname });
      
        if (!user) {
          user = await User.create({
            name,
            isGuest: true // misafir olarak işaretle
          });
        
          // Lig üyelerine misafiri ekle
          league.members.push(user._id);
          await league.save();
        
          // Misafir user'ın liglerini güncelle
          user.leagues.push(league._id);
          await user.save(); // ← bunu eklemen gerekiyordu
        }
        team1PlayerObjects.push({
          user: user._id
        });
      }
  
      // Team2 oyuncuları için ID'leri ve pozisyonları bulalım
      const team2PlayerObjects = [];

      for (let i = 0; i < team2Players.length; i++) {
        const fullName = team2Players[i]; // Örn: "Ahmet Yılmaz"
        const [name, ...surnameParts] = fullName.trim().split(" ");
        const surname = surnameParts.join(" "); // Birden fazla soyisim varsa da çalışsın
      
        let user = await User.findOne({ name: name, surname: surname });
      
        if (!user) {
          user = await User.create({
            name,
            isGuest: true // misafir olarak işaretle
          });
        
          // Lig üyelerine misafiri ekle
          league.members.push(user._id);
          await league.save();
        
          // Misafir user'ın liglerini güncelle
          user.leagues.push(league._id);
          await user.save(); // ← bunu eklemen gerekiyordu
        }
        team2PlayerObjects.push({
          user: user._id
        });
      }
  
      // WeeklyMatch verisini oluştur
      const weeklyMatch = new WeeklyMatch({
        league: league._id,
        team1Players: team1PlayerObjects,  // Array of Player objects
        team2Players: team2PlayerObjects,  // Array of Player objects
        matchDate: new Date(),
      });
  
      // WeeklyMatch'i kaydet
      await weeklyMatch.save();
  
      // Maç sayfasına yönlendir
      res.redirect(`/lig/${ligId}`);
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Bir hata oluştu.');
    }
  };

  const enterResults = async (req, res) => {
    try {
      const { team1TotalGoals, team2TotalGoals } = req.body;
      const ligId = req.params.id;
  
      const weeklyMatch = await WeeklyMatch.findOne({ lig: ligId }).sort({ date: -1 });
  
      if (!weeklyMatch) {
        return res.status(404).send('Maç bulunamadı');
      }
  
      weeklyMatch.result.team1Score = team1TotalGoals;
      weeklyMatch.result.team2Score = team2TotalGoals;
  
      // WeeklyMatch'in goals dizisini sıfırla
      weeklyMatch.goals = [];
  
      // Takım 1 oyuncuları
      for (let player of weeklyMatch.team1Players) {
        const playerGoals = req.body[`team1_${player.user._id}`];
        if (playerGoals) {
          const goalCount = Number(playerGoals);
  
          const user = await User.findById(player.user._id);
          user.goals.total += goalCount;
          user.goals.weekly.push({
            matchId: weeklyMatch._id,
            goals: goalCount
          });
          await user.save();
  
          for (let i = 0; i < goalCount; i++) {
            weeklyMatch.goals.push({
              scorer: player.user._id,
              team: 'team1'
            });
          }
        }
      }
  
      // Takım 2 oyuncuları
      for (let player of weeklyMatch.team2Players) {
        const playerGoals = req.body[`team2_${player.user._id}`];
        if (playerGoals) {
          const goalCount = Number(playerGoals);
  
          const user = await User.findById(player.user._id);
          user.goals.total += goalCount;
          user.goals.weekly.push({
            matchId: weeklyMatch._id,
            goals: goalCount
          });
          await user.save();
  
          for (let i = 0; i < goalCount; i++) {
            weeklyMatch.goals.push({
              scorer: player.user._id,
              team: 'team2' 
            });
          }
        }
      }

      if (weeklyMatch.result.team1Score > weeklyMatch.result.team2Score) {
        weeklyMatch.winner = 'team1';
        for (let player of weeklyMatch.team1Players) {
          const user = await User.findById(player.user._id);
          user.wins += 1;
          await user.save();
        }
      } else if (weeklyMatch.result.team2Score > weeklyMatch.result.team1Score) {
        weeklyMatch.winner = 'team2';
        for (let player of weeklyMatch.team2Players) {
          const user = await User.findById(player.user._id);
          user.wins += 1;
          await user.save();
        }
      }
  
      await weeklyMatch.save();
  
      res.redirect(`/lig/${req.params.ligId}`);
    } catch (err) {
      console.error('Maç sonucu kaydedilirken hata oluştu:', err);
      res.status(500).send('Bir hata oluştu.');
    }
  };

  

  const editLeague = async (req, res) => {
    const ligId = req.params.ligId; // veya req.params.id
    const newName = req.body.name;
    let removedMembers = [];

    try {
        removedMembers = JSON.parse(req.body.removedMembers || '[]');
        removedMembers = removedMembers.map(id => mongoose.Types.ObjectId(id));
    } catch (err) {
        removedMembers = [];
    }

    try {
        const updateResult = await League.findByIdAndUpdate(ligId, { name: newName });
        console.log("Güncelleme sonucu:", updateResult);
        console.log("Gelen silinecek üyeler:", req.body.removedMembers);
         removedMembers = JSON.parse(req.body.removedMembers || '[]');
        if (removedMembers.length > 0) {
          const objectIds = removedMembers.map(id => new mongoose.Types.ObjectId(id));
          console.log("Silincek üyeler : " , objectIds);
            await League.findByIdAndUpdate(ligId, {
                $pull: { members: { $in: objectIds} }
            });
            
        }
        

        res.redirect(`/lig/${ligId}`);
    } catch (error) {
        console.error("Lig güncellenirken hata:", error);
        res.status(500).send("Bir hata oluştu.");
    }
};
  










export { createLeague , joinLeague  , createMatch , enterResults , editLeague};