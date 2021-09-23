const app = require('express')();
const port = process.env.PORT || 5000;
require('dotenv').config();
const { auth, requiresAuth } = require('express-openid-connect');
app.use(
    auth({
        authRequired: false,
        auth0Logout: true,
        issuerBaseURL: process.env.ISSUER_BASE_URL,
        baseURL: process.env.BASE_URL,
        clientID: process.env.CLIENT_ID,
        secret: process.env.SECRET,
    })
)


app.get('/', function(req, res){
    res.send(req.oidc.isAuthenticated() ? 'Logged in': 'Logged out');
});

app.get('/profile', requiresAuth(), (req, res)=>{
    res.send(JSON.stringify(req.oidc.user));
})

app.listen(port, ()=>{
    console.log(`Now listening on port ${port}`)    
});