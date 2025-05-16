import mongoose from "mongoose";

const { Schema} = mongoose;

const UserSchema = new Schema ({
    name: { type: String, required: true },

    surname: { 
      type: String,
      required: function () {
        return !this.isGuest;
      }
    },
  
    email: {
      type: String,
      required: function () {
        return !this.isGuest;
      },
      unique: true,
      sparse: true // Aynı e-posta olmayan misafirler için çakışma engeli
    },
  
    password: {
      type: String,
      required: function () {
        return !this.isGuest;
      }
    },

    leagues: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'League'
    }],

    goals: {
      total: { type: Number, default: 0 },  // Toplam gol sayısı
      weekly: [{
          matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'WeeklyMatch' },
          goals: Number,  // O haftadaki gol sayısı
      }],
  },

  wins: {
    type: Number,
    default: 0
  },
  
    isGuest: { type: Boolean, default: false }
  }); 






const User = mongoose.model("User", UserSchema);

export default User
