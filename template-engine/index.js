
const express = require('express');
const exphbs = require('express-handlebars');
const fs = require('fs')

let equipos = JSON.parse(fs.readFileSync('data/equipos.json', 'utf8'));
//console.log(equipos);

const app = express();
const handlebars = exphbs.create();


app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use(express.static('assets'))
app.use(express.static('data'))

app.get('/', (req, res) => {
    res.render('football_table', {
        layout: 'base',
        data:{
            equipos
        }
    });
});

app.listen(8080);