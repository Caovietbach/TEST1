const express = require('express')
const app = express()
const fs = require('fs')
const session = require('express-session')
app.use(session({ secret: '124447yd@@$%%#', cookie: { maxAge: 60000 }, saveUninitialized: false, resave: false }))
const {getAllDocumentFromCollection,checkUserEmale,checkUserRole,checkUserLogin,ROLE_TABLE_NAME} = require('./databaseHandler')



app.set('view engine', 'hbs')
app.use(express.urlencoded({ extended: true }))
//app.use(express.bodyParser());

app.get('/',(req,res)=>{
    res.render('home')
})

const adminController = require('./controllers/admin')
app.use('/admin', adminController)
const staffController = require('./controllers/staff')
app.use('/staff', staffController)
const qamanagerController = require('./controllers/qamanager')
app.use('/qamanagemer', qamanagerController)
const qacoordinatorController = require('./controllers/qacoordinator')
app.use('/qacoordinator', qacoordinatorController)


app.post("/login", async(req, res) => {
    const userName = req.body.txtName;
    const pass = req.body.txtPassword;
    const user = await checkUserLogin(userName)
    if (user == -1) {
        res.render("login", { errorMsg: "Not found UserName!!" })
    } else {
        console.log(userName)
        const role = await checkUserRole(userName,pass)
        console.log(role)
        if (pass == user.password) {
            const role = await checkUserRole(userName,pass)
            const email = await checkUserEmale(userName,pass)
            if (role == -1) {
                res.render("login", { errorMsg: "Login failed!" })
            } else {
                req.session.user = {
                    userName: userName,
                    role: role,
                    email: email
                }
                console.log("Login with: ")
                console.log(req.session.user)
                if (role == "Staff") {
                    req.session.save()
                    res.redirect('/staff/home')
                } 
                if (role == "QAManager") {
                    req.session.save()
                    res.redirect("/qamanager/home")
                } 
                if (role == "QAManager") {
                    req.session.save()
                    res.redirect("/qacoordinator/home")
                }
                if (role == "Admin") {
                    req.session.save()
                    res.redirect("/admin/home")
                } 
            }  
        } else {
            res.render("login", { errorMsg: "Incorrect password!!" })
            console.log(user.password)
            console.log(pass)
        }
    }
})


app.get('/login', async(req,res)=>{
    console.log(req.session.error)
    res.render('login', {errorMsg: req.session.error})
    delete req.session.error
})

app.get("/logout", (req, res) => {
    req.session.user = null
    res.redirect("/")
})


const PORT = process.env.PORT || 5000
app.listen(PORT)
console.log("Server is running! " + PORT)