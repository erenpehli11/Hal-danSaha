import mongoose from 'mongoose';

const conn = () => {
    mongoose.connect(process.env.DB_URI, {
        dbName: 'Halisaha',
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('Database connection successful');
    })
    .catch((err) => {
        console.error('Database connection error:', err);
    });
};

export default conn;