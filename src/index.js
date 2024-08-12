const express = require('express');
const router = express.Router();
const cors = require('cors');
const path = require('path');
require('dotenv').config();


const port = process.env.PORT;
const publicPath = path.join(__dirname, './../public');

const app = express();
app.use(cors());
app.use(express.static(publicPath));

app.get('/getMacros', (req, res) =>{
    res.sendFile('index.html');
});

app.listen(port);