import mongoose from 'mongoose';

const { Schema } = mongoose;

const playerSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  position: { type: String }, // Örn: 'Forvet', 'Kaleci', 'Stoper' vb.
});

const matchSchema = new Schema(
  {
    league: { type: mongoose.Schema.Types.ObjectId, ref: 'League', required: true },
    team1Players: [playerSchema], // 1. takım oyuncuları
    team2Players: [playerSchema], // 2. takım oyuncuları
    team1Score: { type: Number, default: 0 },
    team2Score: { type: Number, default: 0 },
    matchDate: { type: Date, required: true },
  },
  {
    timestamps: true, // createdAt ve updatedAt otomatik olarak gelir
  }
);

const Match = mongoose.model('Match', matchSchema);

export default Match;