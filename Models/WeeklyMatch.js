import mongoose from "mongoose";


const WeeklyMatchSchema = new mongoose.Schema({
  league: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'League',
    required: true
  },

  date: {
    type: Date,
    default: Date.now
  },

  team1Players: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    position: { type: String }
  }],

  team2Players: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    position: { type: String }
  }],

  result: {
    team1Score: { type: Number, default: 0 },
    team2Score: { type: Number, default: 0 }
  },

  goals: [{
    scorer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    minute: { type: Number },  // opsiyonel: gol dakikası
    team: { type: String, enum: ['team1', 'team2'] }
  }],

  isPublished: {
    type: Boolean,
    default: false
  },

  winner: {
    type: String, // 'team1' veya 'team2' olabilir
    enum: ['team1', 'team2', 'draw'], // beraberlik de olabilir istersen
    default: null
  }
});

const WeeklyMatch = mongoose.model("weeklyMatch", WeeklyMatchSchema);

export default WeeklyMatch