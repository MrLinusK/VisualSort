const { Console } = require('console');
const express = require('express');
const path = require('path');
const PORT = process.env.PORT
const app = express();

const publicPath = path.join(__dirname, './../public');
app.use(express.static(publicPath));

app.get('*', (req, res) => {
    

    console.log(req.path)
    const file = req.path.split('/').at(-1)

    try{
        const contentType = {
            "js": "text/javascript",
            "css": "text/css",
            "html": "text/html",
            "ico": "image/x-icon",
        }[file.split('.').at(-1)];
        
    
        const fs = require('fs');
        res.status(200);
        res.setHeader('content-type', contentType);
        res.send(fs.readFileSync(path.join(publicPath, file)).toString());
    }
    catch{
        res.status(500);
        console.warn('Cant find: ' + path.join(publicPath, file))
    }
});

app.listen(80, () => {
    console.log(`Running on 80`)
});