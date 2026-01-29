require('dotenv').config(); 
const mongoose = require('mongoose');
const Measurement = require('./models/Measurement');

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => {
        console.error('Atlas Connection Error:', err);
        process.exit(1);
    });

const generateData = async () => {
    try {
        if (mongoose.connection.readyState !== 1) {
             await new Promise(resolve => mongoose.connection.once('open', resolve));
        }

        console.log("Clearing old data...");
        await Measurement.deleteMany({}); 

        const data = [];
        
        const startDate = new Date('2026-01-01');

        console.log("Generating data with values between -31 and 35...");

        for (let i = 0; i < 35; i++) { 
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);

            const randomValue1 = Math.floor(Math.random() * 67) - 31; 
            const randomValue2 = Math.floor(Math.random() * 67) - 31;
            const randomValue3 = Math.floor(Math.random() * 67) - 31;

            data.push({
                timestamp: currentDate,
                field1: randomValue1, 
                field2: randomValue2,
                field3: randomValue3
            });
        }

        await Measurement.insertMany(data);
        console.log(`Seeded ${data.length} records successfully!`);
        
        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
};

generateData();