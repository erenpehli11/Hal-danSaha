import mongoose from 'mongoose';

const LeagueSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
});

const League = mongoose.model('League', LeagueSchema);

export default League;