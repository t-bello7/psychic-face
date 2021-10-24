const fs = require('fs');
const path = require('path');

const express = require('express');
const expressSession = require("express-session");
const passport = require("passport");
const Auth0Strategy = require("passport-auth0");
const mongoose = require('mongoose');

// const { auth, requiresAuth } = require('express-openid-connect');
const multer = require('multer');
const authRouter = require("./auth");

// const faceapi = require("face-api.js")
require('dotenv').config();
const mongoDB =  process.env.MONGO_URL
const port = process.env.PORT || 5000;

//Schema class from the mongoose module
const Schema = mongoose.Schema;
mongoose.connect(mongoDB,{useNewUrlParser:true, useUnifiedTopology: true});

// Start a server instance with express
const app = express();
const router = express.Router();
// Start a database instance
const db = mongoose.connection;
// add face detection
const faceapi = require('./detector');
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const session = {
    secret: process.env.SESSION_SECRET,
    cookie: {},
    resave: false,
    saveUninitialized: false
  };

  if (app.get("env") === "production") {
    // Serve secure cookies, requires HTTPS
    session.cookie.secure = true;
  }
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
        contentType: String
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

// // Auth0 
// app.use(
//     auth({
//         authRequired: false,
//         auth0Logout: true,
//         session:{
//             cookie:{
//                 domain: 'localhost'
//             }
//         },
//         issuerBaseURL: process.env.ISSUER_BASE_URL,
//         baseURL: process.env.BASE_URL,
//         clientID: process.env.CLIENT_ID,
//         secret: process.env.SECRET,
//     })
// )
// setting up json middleware
app.use(express.json());


//setting up static files
app.use(express.static(path.join(__dirname, "public")));

app.use(expressSession(session));

//setting up view's & EJS
app.set("views", path.join(__dirname, "views"));
// app.set('view engine','ejs');
app.set("view engine", "pug");

app.set('trust proxy', true)
const strategy = new Auth0Strategy(
    {
      domain: process.env.AUTH0_DOMAIN,
      clientID: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      callbackURL: process.env.AUTH0_CALLBACK_URL
    },
    function(accessToken, refreshToken, extraParams, profile, done) {
      /**
       * Access tokens are used to authorize users to an API
       * (resource server)
       * accessToken is the token to call the Auth0 API
       * or a secured third-party API
       * extraParams.id_token has the JSON Web Token
       * profile has all the information from the user
       */
      return done(null, profile);
    }
  );
passport.use(strategy);
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
});


app.use("/", authRouter);


passport.serializeUser((user, done) => {
    done(null, user);
  });
  
  passport.deserializeUser((user, done) => {
    done(null, user);
  });


  
//routing

const secured = (req, res, next) => {
    if (req.user) {
      return next();
    }
    // req.session.returnTo = req.originalUrl;
    res.redirect("/login");
  };
  
app.get('/check', secured, (req, res)=>{
    res.render('check');
 })

app.get("/home", secured, (req, res, next) => {
  // const items = studentModel.find()
  const items = {
    
  }
  res.render('home',{items:items})
});
app.get("/", (req, res, next) => {
    res.render('index')
});


app.get("/profile", secured, (req, res, next) => {
    const { _raw, _json, ...userProfile } = req.user;
    res.render("user", {
      title: "Profile",
      userProfile: userProfile
    });
  });

app.post('/register', secured, upload.single('studentImage'),(req, res, next)=>{


    let obj = {
        first_name : req.body.firstName,
        last_name : req.body.lastNname,
        student_image: {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
            // contentType : 'image/png'
        }
    }
    
    studentModel.create(obj, (err, item) => {
        if(err){
            console.log(err.field);
        }
        else{
            item.save();
            res.redirect('/home');
        }
    });
    
});
app.get('/check/:studentId', secured, (req, res, next)=>{
    //query to get student img
    // improve to get 5 student_imag 
})

app.post("/upload", async(req, res)=>{
  const {file} = req.files;
  const result = await faceapi.detect(file.data);

  res.json({
    detectedFaces: result.length,
  });
});


app.listen(port, ()=>{
    console.log(`Now listening on port ${port}`)    
});