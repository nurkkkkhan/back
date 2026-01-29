require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Measurement = require('./models/Measurement'); 


const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json()); 
app.use(express.static('public'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

const ALLOWED_FIELDS = ['field1', 'field2', 'field3']; 

const validateRequest = (query) => {
    const { field, start_date, end_date } = query;
    const errors = [];

    if (field && !ALLOWED_FIELDS.includes(field)) {
        errors.push(`Invalid field. Allowed: ${ALLOWED_FIELDS.join(', ')}`);
    }
    if (start_date && isNaN(Date.parse(start_date))) errors.push("Invalid start_date format.");
    if (end_date && isNaN(Date.parse(end_date))) errors.push("Invalid end_date format.");

    return errors;
};


app.get('/api/measurements', async (req, res) => {
    console.log("------------------------------------------");
    console.log("Incoming GET Request:", req.query);

    const errors = validateRequest(req.query);
    if (errors.length > 0) return res.status(400).json({ errors });

    const { field, start_date, end_date } = req.query;

    try {
        let query = {};
        if (start_date || end_date) {
            query.timestamp = {};
            
            if (start_date) {
                const start = new Date(start_date);
                query.timestamp.$gte = start;
                console.log("Filter Start:", start.toString());
            }
            
            if (end_date) {
                const end = new Date(end_date);
                end.setDate(end.getDate() + 1); 
                query.timestamp.$lt = end;     
                console.log("Filter End:  ", end.toString());
            }
        }

        const projection = { timestamp: 1, [field]: 1, _id: 0 };
        
        const data = await Measurement.find(query, projection).sort({ timestamp: 1 });

        console.log(`Found ${data.length} records.`);
        res.json(data);
    } catch (err) {
        console.error("Server Error:", err);
        res.status(500).json({ error: "Server Error" });
    }
});

app.get('/api/measurements/metrics', async (req, res) => {
    const { field, start_date, end_date } = req.query;

    try {
        let matchStage = {};
        if (start_date || end_date) {
            matchStage.timestamp = {};
            if (start_date) matchStage.timestamp.$gte = new Date(start_date);
            if (end_date) {
                const end = new Date(end_date);
                end.setDate(end.getDate() + 1);
                matchStage.timestamp.$lt = end;
            }
        }

        const metrics = await Measurement.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    avg: { $avg: `$${field}` },
                    min: { $min: `$${field}` },
                    max: { $max: `$${field}` },
                    stdDev: { $stdDevPop: `$${field}` }
                }
            },
            {
                $project: {
                    _id: 0,
                    avg: { $round: ["$avg", 2] },
                    min: { $round: ["$min", 2] },
                    max: { $round: ["$max", 2] },
                    stdDev: { $round: ["$stdDev", 2] }
                }
            }
        ]);

        if (metrics.length === 0) return res.json({ avg: 0, min: 0, max: 0, stdDev: 0 });
        res.json(metrics[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Metrics Error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});