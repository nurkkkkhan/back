const express = require('express')
const bodyParser = require("body-parser");
const path = require('path');
const PORT = process.env.PORT || 3000;

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.post("/convert-temp", (req, res) => {
  const value = parseFloat(req.body.tempValue);
  const convertTo = req.body.tempType;

  if (isNaN(value)) return res.send("Invalid input!");

  let result;
  if (convertTo === "toF") {
    result = `${(value * 9 / 5 + 32).toFixed(2)}Â°F`;
  } else {
    result = `${((value - 32) * 5 / 9).toFixed(2)}Â°C`;
  }

  res.send(`<h2>${result}</h2><a href="/">Back</a>`);
});

app.post("/convert-distance", (req, res) => {
  const value = parseFloat(req.body.distValue);
  const convertTo = req.body.distType;

  if (value <= 0) return res.send("Value must be positive!");

  let result;
  if (convertTo === "toMiles") {
    result = `${value} km = ${(value * 0.621371).toFixed(2)} miles`;
  } else {
    result = `${value} miles = ${(value / 0.621371).toFixed(2)} km`;
  }

  res.send(`<h2>${result}</h2><a href="/">Back</a>`);
});


app.get('/*splat', (req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

app.listen(3000, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});