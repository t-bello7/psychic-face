const fs = require('fs');
const path = require('path');

const express = require('express');

const mongoose = require('mongoose');

const { auth, requiresAuth } = require('express-openid-connect');
const multer = require('multer');

//I'm yet to implement the api as of these blog post 
const faceapi = require("face-api.js")
require('dotenv').config();
const mongoDB =  process.env.MONGO_URL
const port = process.env.PORT || 5000;

//Schema class from the mongoose module
const Schema = mongoose.Schema;
mongoose.connect(mongoDB,{useNewUrlParser:true, useUnifiedTopology: true});

// Start a server instance with express
const app = express();

// Start a database instance
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


//Build a Schema for our student collection in our database 
let studentModelSchema = new Schema({
    first_name : {
        type: String
    },
    last_name : {
        type: String
    },
    student_image : {
        data : Buffer,
        contenType: String
    }
})


//Build a Model based one the studentModelSchema 
let studentModel = mongoose.model('studentModel', studentModelSchema )

// set up a storage path with multer to store uploaded image file
let storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, 'uploads')
    },
    filename: (req, file, cb) =>{
        cb(null, file.fieldname + '-' + Date.now())
    }
});


let upload = multer({ storage: storage});

// Auth0 
app.use(
    auth({
        authRequired: false,
        auth0Logout: true,
        session:{
            cookie:{
                domain: 'localhost'
            }
        },
        issuerBaseURL: process.env.ISSUER_BASE_URL,
        baseURL: process.env.BASE_URL,
        clientID: process.env.CLIENT_ID,
        secret: process.env.SECRET,
    })
)
// setting up json middleware
app.use(express.json());


//setting up static files
app.use(express.static('public'));
//setting up view's & EJS
app.set('views', './views');
app.set('view engine','ejs');

app.set('trust proxy', true)


// Navigation
app.get('/', function(req, res){
    studentModel.find({}, (err,items)=>{
        if (err){
            console.log(err);
            res.status(500).send("An error occured", err);
        }
        else {
        res.render(req.oidc.isAuthenticated() ? 'home' : 'index', {items:items});
        }
    })
});

//--My AI logic
app.get('/check', (req, res)=>{
    res.render('check');
 })


// app.get('/register',(req, res)=>{
//    res.render('register')
// })

app.get('/profile', requiresAuth(), (req, res)=>{
    res.send(JSON.stringify(req.oidc.user));
})


app.post('/regsiter-student', requiresAuth(), upload.single('student_image'),(req, res, next)=>{
    let obj = {
        first_name : req.body.first_name,
        last_name : req.body.last_name,
        student_image: {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
            contentType : 'image/png'
        }
    }
    studentModel.create(obj, (err, item) =>{
        if(err){
            console.log(err);
        }
        else{
            item.save();
            res.redirect('/');
        }
    });
    
});

app.post('/check', requiresAuth(), (req, res, next)=>{
    console.log(req.body)
})

app.listen(port, ()=>{
    console.log(`Now listening on port ${port}`)    
});