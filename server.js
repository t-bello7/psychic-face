const fs = require('fs');
const path = require('path');
const express = require('express');
const expressSession = require("express-session");
const passport = require("passport");
const Auth0Strategy = require("passport-auth0");
const multer = require('multer');
const authRouter = require("./auth");
const cors = require('cors');
const mysql = require('mysql2');

require('dotenv').config();

const port = process.env.PORT || 5000;

// Start a server instance with express
const app = express();
app.use(cors({origin:'*'}));

// Start a database instance
const pool = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER_DB,
  port: process.env.PORT_DB,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  connectionLimit: 20,
  queueLimit: 0,
  multipleStatements: true,
  waitForConnections: true
})

// Set up Auth0 strategy
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

const createStudentDb = async () => { 
 pool.getConnection((err, connection) => {
    if(err) throw err;
    let sql = "CREATE TABLE IF NOT EXISTS students(id int(5) NOT NULL AUTO_INCREMENT, first_name VARCHAR(255) NOT NULL, last_name VARCHAR(255) NOT NULL, student_image VARCHAR(255) NOT NULL, image_descriptor TEXT, PRIMARY KEY(id))";
    connection.query(sql, function(err, result){
      if (err) throw err;
    })
  })
}

createStudentDb();


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

// set up a storage engine with multer to store uploaded image file
let storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, 'uploads')
    },
    filename: (req, file, cb) =>{
        cb(null, file.fieldname+'-'+Date.now()+path.extname(file.originalname))
    }
});

let checkFileType = (file, cb) =>{
  const filetypes = /jpeg|jpg|png|gif/;
  // check the extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  //check mimetype
  const mimetype = filetypes.test(file.mimetype);

  (mimetype && extname ) ? cb(null, true) : cb('Error: Images Only !  ')

}

let upload = multer({ 
  storage: storage, 
  fileFilter: (req, file,cb)=>{
  checkFileType(file, cb)},
  limits: { fileSize: 1024 * 1024 * 5 }
  
});



//setting up static files
passport.use(strategy);
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use('/uploads',express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "checks")));
app.use(expressSession(session));
app.use(passport.initialize());
app.use(passport.session());

//setting up view's & EJS
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.set('trust proxy', true);


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
  
const secured = (req, res, next) => {
    if (req.user) {
      return next();
    }
    res.redirect("/login");
  };
  

app.get("/", (req, res, next) => {
    res.render('index')
});

app.get("/home", secured, (req, res, next) => {
    res.render('home')
});

app.get('/add-student', secured, (req, res)=>{
  res.render("add-student")
});

app.get('/all-students', secured,(req, res) =>{
  let sql = 'SELECT * from students'
  pool.query(sql, (err, result)=>{
    if (err) throw err;
    console.log(result)
    res.render('all-students', {items:result})
  })
})

app.get("/profile", secured, (req, res, next) => {
  const { _raw, _json, ...userProfile } = req.user;
  res.render("user", {
    title: "Profile",
    userProfile: userProfile
  });
});

app.post('/register',secured, upload.single('studentImage'),(req, res)=>{
  let image = path.join('/uploads/' + req.file.filename)
  let obj = {
      first_name : req.body.firstName,
      last_name : req.body.lastName,
      student_image: image,
      image_descriptor: req.body.faceDescriptor,
    };
  let sql = 'INSERT INTO students SET ?';
  pool.query(sql, obj, (err,result) => {
    if(err) throw err;
    res.redirect('/all-students');
  })  
 
});

app.get("/verify-student", secured, (req, res)=>{
  res.render('verify-student')
})

app.get("/check", secured, (req, res)=>{
  let sql = 'SELECT image_descriptor FROM students';
  pool.query(sql, (err, result)=>{
    if (err) throw err;
    res.json(result)
  })
});

app.get("/models/:modelName", (req, res)=>{
  const facePath = path.join(__dirname, `/models/${req.params.modelName}`)
  let readfile = fs.readFile(facePath, 'utf-8', (err,data)=>{
    if(err){
      console.error(err)
      return
    }
    res.json(data)
  })
})

app.listen(port, ()=>{
    console.log(`Now listening on port ${port}`)    
});