
const express = require('express');
const exphbs = require('express-handlebars');
const fs = require('fs');
const { basename } = require('path');
const multer = require('multer');
const upload = multer();

let equipos = JSON.parse(fs.readFileSync('data\\equipos.json', 'utf8'));

const app = express();
const handlebars = exphbs.create();

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

//middlewares

app.use(express.json());

app.use(upload.array()); //middleware for multipart/form-data
app.use(express.static('public'));

app.use(express.static('assets'))
app.use(express.static('data'))
app.use((req,res, next) => {
    console.log(`[${new Date()}] - Llamada a ${req.method} ${req.url}`);
    next();
})

app.get('/', (req, res) => {
    res.render('football_table', {
        layout: 'base',
        data:{
            equipos
        }
    });
});

app.get('/add', (req, res) => {

    res.render('addForm', {
        layout: 'addBase'

    });
});

app.get('/update/:id', (req,res) =>{

    const teamId = parseInt(req.params.id);
    console.log(teamId);
    res.render('updateForm', {
        layout: 'addBase',
        data:{
            name: findTeam(teamId, equipos).name,
            country: findTeam(teamId, equipos).area.name,
            crestURL: findTeam(teamId, equipos).crestUrl,
            teamId,
        }

    });
})

app.post('/updateTeam', (req, res) => {
    const reqTeam = JSON.parse(JSON.stringify(req.body)); // workaround to get rid of [Object: null prototype]
    console.log(reqTeam)
    if(validForm(reqTeam.name, reqTeam.country, reqTeam.crestURL, reqTeam.teamId)){
        const teamIndex = equipos.indexOf(findTeam(parseInt(reqTeam.originalTeamId), equipos));
        console.log("found team to update")
        console.log(teamIndex)

        equipos[teamIndex].name = reqTeam.name;
        equipos[teamIndex].area.name = reqTeam.country;
        equipos[teamIndex].crestUrl = reqTeam.crestURL;
        equipos[teamIndex].id = parseInt(reqTeam.teamId);
        console.log(equipos);
        fs.writeFileSync('data\\equipos.json', JSON.stringify(equipos) );
        res.redirect('/');
    }

})

app.post('/sendTeam', (req, res) => {

    const reqTeam = JSON.parse(JSON.stringify(req.body)); // workaround to get rid of [Object: null prototype]
    if(validForm(reqTeam.name, reqTeam.country, reqTeam.crestURL, reqTeam.teamId)){
        equipos.push( newTeam(reqTeam.name,
            reqTeam.crestURL,
            reqTeam.country,
            parseInt(reqTeam.teamId)) );
            fs.writeFileSync('data\\equipos.json', JSON.stringify(equipos) );
            res.redirect('/');
    }
    else{
        console.error('Invalid form');

        let validationClassName='';
        let validationClassCountry ='';
        let validationClassURL='';
        let validationClassId='';

        if(reqTeam.name === ''){
            validationClassName = 'is-invalid'
        }
        if(reqTeam.country === ''){
            validationClassCountry = 'is-invalid'
        }
        if(reqTeam.crestURL === ''){
            validationClassURL = 'is-invalid'
        }
        if(reqTeam.teamId === ''){
            validationClassId = 'is-invalid'
        }

        res.render('addForm', {
            layout: 'addBase',
            data:{
                name:reqTeam.name,
                country: reqTeam.country,
                crestURL: reqTeam.crestURL,
                teamId: reqTeam.teamId,
                validationClassName,
                validationClassCountry,
                validationClassURL,
                validationClassId,
            }
        })
    }
});

app.post('/deleteTeam/:id', (req,res) => {

    const idTeam = parseInt(req.params.id)
    if( findTeam(idTeam,equipos) !== undefined){
    equipos = deleteTeam(idTeam,equipos);
    fs.writeFileSync('data\\equipos.json', JSON.stringify(equipos) );
    res.redirect('/');
    }
    else{
        console.error("Team with such id doesn't exist");
        res.status(404).end();
    }
})

app.get('/delete/:id', (req, res) => {

    res.render('deleteForm', {
        layout: 'addBase',
        data: {
            teamName: findTeam(parseInt(req.params.id), equipos).name,
            id: req.params.id
        }
    });
});

function newTeam(teamName,teamCrest,teamCountry,teamId){
    return {name: teamName,
            area: {name: teamCountry},
            crestUrl: teamCrest,
            id: teamId
    }
}

function findTeam(id,equipos){

    return equipos.find(equipo => equipo.id === id);

}

function deleteTeam(id,equipos){ //returns an updated equipos object

    const teamToDelete = findTeam(id,equipos);

    return equipos.filter(equipo => equipo !== teamToDelete);

}

function validForm(name, country, crestURL, teamId){
    return  name !=='' && 
            country !== '' &&
            crestURL !== '' &&
            teamId !== '';
}

const PORT = 8080;

app.listen(PORT);
console.log(`Listening on port ${PORT}`);