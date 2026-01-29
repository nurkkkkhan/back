const mongoose = require('mongoose');
const Measurement = require('./models/Measurement');

mongoose.connect('mongodb://127.0.0.1:27017/analyticsDB')
    .then(() => console.log('MongoDB Connected for Seeding'))
    .catch(err => console.error('Connection Error:', err));

const generateData = async () => {
    try {
        await Measurement.deleteMany({}); 

        const data = [];
        const startDate = new Date('2026-01-01');

        for (let i = 0; i < 30; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);

            data.push({
                timestamp: currentDate,
                field1: Math.floor(Math.random() * 50) + 10,
                field2: Math.floor(Math.random() * 100),
                field3: Math.floor(Math.random() * 1000) + 500
            });
        }

        await Measurement.insertMany(data);
        console.log('Database Seeded with Dummy Data!');
        
        await mongoose.connection.close();
    } catch (err) {
        console.error("Seeding failed:", err);
    }
};

generateData();