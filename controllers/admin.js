const express = require('express')
const async = require('hbs/lib/async')
const {ObjectId} = require('bson')
const router = express.Router()
const {getDB,insertObject,getAnIdea,getAllDocumentFromCollection,getAccount,updateIdeaLikeCount,
    checkUserLike,checkUserEmale,checkUserDislike, getAEvent, editEvent, checkExistEmail,
    ROLE_TABLE_NAME,USER_TABLE_NAME,IDEA_TABLE_NAME,POSTLIKE_TABLE_NAME,POSTDISLIKE_TABLE_NAME,COMMENT_TABLE_NAME,EVENT_TABLE_NAME,DEPARTMENT_TABLE_NAME
    ,getAnAccount,updateAccount, getIdeaFeedback,} = require('../databaseHandler')

function requiresLoginAdmin(req,res,next){
    if(req.session.user){
        if(req.session.user.role != "Admin"){
            res.redirect('/login');
        }
        return next()
    }else{
        res.redirect('/login')
    }
}



//POST

router.post('/newAccount',requiresLoginAdmin, (req,res)=>{
    
    const name = req.body.txtName
    const email = req.body.txtEmail
    const role = req.body.Role
    const department = req.body.Department
    const pass= req.body.txtPassword
    const result = checkExistEmail(email)

    if (name.lenght == 0){
        req.session.error.msg = "An account must have a name"
        res.redirect('/admin/newAccount')
    } else if (email.lenght == 0){
        req.session.error.msg = "An account must have an email"
        res.redirect('/admin/newAccount')
    } else if (role == 'None'){
        req.session.error.msg = "An account must have a role"
        res.redirect('/admin/newAccount')
    } else if (role == "Admin" | role == "QAManager" & department != 'None'){
        req.session.error.msg = "Admin or Quality Assurance Manager does not need a department"
        res.redirect('/admin/newAccount')
    } else if (role == "Staff" | role == "QACoordinator" & department == 'None') {
        req.session.error.msg = "Staff or Quality Assurance Coordinator must have a department"
        res.redirect('/admin/newAccount')
    } else if (password.lenght == 0){
        req.session.error.msg = "An account must have a password"
        res.redirect('/admin/newAccount')
    } else if (result == "-1"){
        req.session.error.msg = "This email has been used"
        res.redirect('/admin/newAccount')
    }
    else {
        const objectToInsert = {
            'userName': name,
            'email': email,
            'role': role,
            'department': department,
            'password': pass
        }
        insertObject(USER_TABLE_NAME,objectToInsert)
        res.redirect('/admin/viewAccount')
    }
    
})

router.post('/doUpdateAccount', async (req,res)=>{
    var id = req.body.id;
    var objectId = ObjectId(id)
    const username = req.body.txtUsername
    const password = req.body.txtPassword
    const email = req.body.txtEmail
    const role = req.body.Role
    const department = req.body.txtDepartment
    var account = {
        'userName': name,
        'email': email,
        'role': role,
        'department': department,
        'password': pass
    } 
    const result = checkExistEmail(email)

    if (username.lenght == 0){
        req.session.error.msg = "An account must have a name"
        res.redirect('/admin/doUpdateAccount')
    } else if (email.lenght == 0){
        req.session.error.msg = "An account must have an email"
        res.redirect('/admin/doUpdateAccount')
    } else if (role == 'None'){
        req.session.error.msg = "An account must have a role"
        res.redirect('/admin/doUpdateAccount')
    } else if (role == "Admin" | role == "QAManager" & department != 'None'){
        req.session.error.msg = "Admin or Quality Assurance Manager does not need a department"
        res.redirect('/admin/doUpdateAccount')
    } else if (role == "Staff" | role == "QACoordinator" & department == 'None') {
        req.session.error.msg = "Staff or Quality Assurance Coordinator must have a department"
        res.redirect('/admin/doUpdateAccount')
    } else if (password.lenght == 0){
        req.session.error.msg = "An account must have a password"
        res.redirect('/admin/doUpdateAccount')
    } else if (result == "-1"){
        req.session.error.msg = "This email has been used"
        res.redirect('/admin/doUpdateAccount')
    }
    const check = await updateAccount(objectId,account)
    console.log(check)
    res.redirect('/admin/viewAccount')
})

router.post('/createEvent',async (req,res)=>{
    const name = req.body.txtName
    console.log(name)
    const startDate = new Date(req.body.startDate).toISOString()
    console.log(startDate)
    const endDate = new Date(req.body.endDate).toISOString()
    console.log(endDate)

    const realtimeDate = new Date().getTime() 
    console.log(realtimeDate)
    const sDate = new Date(req.body.startDate).getTime()
    const eDate = new Date(req.body.endDate).getDate()
    if (sDate < realtimeDate){
        const errorMessage = "The event start date is passed"
        res.render('admin/createEvent',{errorName:errorMessage})
        console.log("1")
        return;
    } else if(eDate > realtimeDate) {
        const errorMessage = "The event end date is passed"
        res.render('admin/createEvent',{errorName:errorMessage})
        console.log("2")
        return;
    } else if (eDate > sDate) {
        const errorMessage = "The event end date is earlier than the start date"
        res.render('admin/createEvent',{errorName:errorMessage})
        console.log("3")
        return;
    } else {
        var event = {
            'name' : name,
            'startDate' : startDate,
            'endDate' : endDate
        }
        const check = await insertObject(EVENT_TABLE_NAME,event)
        console.log(check)
        res.redirect('/admin/viewEvent')
    }
    
})

router.post('/editEvent', async (req,res)=>{
    var id = req.body.id;
    var objectId = ObjectId(id)
    const name = req.body.TxTName
    const startDate = Date.parse(req.body.StartDate)
    const endDate = Date.parse(req.body.EndDate)
    if (sDate < realtimeDate){
        req.session.error.msg = "The event start date is passed"
        
    } else if(eDate > realtimeDate) {
        const errorMessage = "The event end date is passed"
        
    } else if (eDate > sDate) {
        const errorMessage = "The event end date is earlier than the start date"
        
    } else {
        var event = {
            'name' : name,
            'startDate' : startDate,
            'endDate' : endDate
        }
        const check = await insertObject(EVENT_TABLE_NAME,event)
        console.log(check)
        res.redirect('/admin/viewEvent')
    }
    var event = {
        'name' : name,
        'startDate' : startDate,
        'endDate' : endDate
    }
    var check = await editEvent(objectId, event)
    console.log(check)
    res.redirect('/admin/viewEvent')
})

router.post('/submitComment', async (req,res)=>{
    var id = req.body.id
    console.log(id)
    const user = req.session.user.userName
    const context = req.body.txtComment
    const anon = req.body.Anon
    if (anon == "Yes"){
        var com = {
            'ideaID' : id,
            'user' : "Anonymous",
            'context' : context
        }
    } else {
        var com = {
            'ideaID' : id,
            'user' : user,
            'context' : context
        }
    }
    const check = await insertObject(COMMENT_TABLE_NAME,com)
    console.log(check)
    res.redirect('/admin/viewIdea')
})
//GET

router.get('/home',(req,res)=>{
    res.render('admin/home')
})


////////////////////////////////////////////  ACCOUNT MANAGEMENT ///////////////////////////////////////////////

router.get('/newAccount', async(req,res)=>{
    const results = await getAllDocumentFromCollection(ROLE_TABLE_NAME)
    console.log(results)
    const departments = await getAllDocumentFromCollection(DEPARTMENT_TABLE_NAME)
    console.log(departments)
    if(req.session.error.msg != null){
        var errorMessage = req.session.error.msg
    }
    res.render('admin/newAccount',{'roles':results,'departments':departments, 'errorMessage':errorMessage})
    req.session.error.msg = null
})

router.get('/updateAccount', async (req,res)=>{
    var id = req.query.id;
    var objectId = ObjectId(id)
    var account = await getAnAccount(objectId);
    const roles = await getAllDocumentFromCollection(ROLE_TABLE_NAME)
    const departments = await getAllDocumentFromCollection(DEPARTMENT_TABLE_NAME)
    console.log(departments)
    res.render('admin/updateAccount',{'account':account,'roles':roles,'departments':departments})
})

router.get('/deleteAccount',async (req,res)=>{
    let id = req.query.id
    console.log(id)
    let objectId = ObjectId(id)
    let dbo = await getDB()
    await dbo.collection(USER_TABLE_NAME).deleteOne({_id:objectId})
    res.redirect('/admin/viewAccount')
})

router.get('/viewAccount',async (req,res)=>{
    let result = await getAccount()
    res.render('admin/viewAccount',{'accounts': result})
})

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

                                                    //++++//

///////////////////////////////////////////////// LIKE ///////////////////////////////////////////////////////////////////////
router.get('/likeIdea', async (req, res) => {
    const id = req.query.id
    const objectId = ObjectId(id)
    const userEmail = req.session.user.email
    const testLike = await checkUserLike(objectId,userEmail)
    const testDislike = await checkUserDislike(objectId,userEmail)
    if (testLike == 1){
        res.redirect('/admin/viewIdea')
    } else if (testDislike == 1){
        const idea = await getAnIdea(objectId)
        console.log("So like hien tai la " + idea.likeCount)
        const count = idea.likeCount
        const newLikeCount = count + 2
        console.log("So like moi se la:" + newLikeCount)
        await updateIdeaLikeCount(objectId,newLikeCount)
        const userThatLike ={
            'ideaID' : objectId,
            'userEmail' : req.session.user.email
        }
        const dbo = await getDB()
        await dbo.collection(POSTDISLIKE_TABLE_NAME).deleteOne({_id: objectId, userEmail: userEmail})
        await insertObject(POSTLIKE_TABLE_NAME,userThatLike)
        console.log("Success")
        res.redirect('/admin/viewIdea')
    } else {
        var idea = await getAnIdea(objectId)
        console.log("So like hien tai la " + idea.likeCount)
        var count = parseInt(idea.likeCount)
        var newLikeCount = count + 1
        console.log("So like moi se la:" + newLikeCount)
        await updateIdeaLikeCount(objectId,newLikeCount)
        const userThatLike ={
            'ideaID' : objectId,
            'userEmail' : req.session.user.email
        }
        console.log(userThatLike)
        await insertObject(POSTLIKE_TABLE_NAME,userThatLike)
        console.log("Success")
        res.redirect('/admin/viewIdea')
    }
})

router.get('/dislikeIdea', async (req, res) => {
    const id = req.query.id
    console.log(id)
    const objectId = ObjectId(id)
    const userEmail = req.session.user.email
    console.log(userEmail)
    const testDislike = await checkUserDislike(objectId,userEmail)
    const testLike = await checkUserLike(objectId,userEmail)
    console.log(testDislike)
    console.log(testLike)
    if (testDislike == 1) {
        res.redirect('/admin/viewIdea')
    } else if (testLike == 1){
        var idea = await getAnIdea(objectId)
        console.log("So like hien tai la " + idea.likeCount)
        var count = parseInt(idea.likeCount)
        var newLikeCount = count - 2
        console.log("So like moi se la:" + newLikeCount)
        await updateIdeaLikeCount(objectId,newLikeCount)
        const userThatDislike ={
            'ideaID' : objectId,
            'userEmail' : req.session.user.email
        }
        const dbo = await getDB()
        await dbo.collection(POSTLIKE_TABLE_NAME).deleteOne({_id: objectId, userEmail: userEmail})
        await insertObject(POSTDISLIKE_TABLE_NAME,userThatDislike)
        console.log("Success")
        res.redirect('/admin/viewIdea')
    } else {
        var idea = await getAnIdea(objectId)
        console.log("So like hien tai la: " + idea.likeCount)
        var count = parseInt(idea.likeCount)
        var newLikeCount = count - 1
        console.log("So like moi se la: " + newLikeCount)
        await updateIdeaLikeCount(objectId,newLikeCount)
        const userThatDislike ={
            'ideaID' : objectId,
            'userEmail' : req.session.user.email
        }
        console.log(userThatDislike)
        await insertObject(POSTDISLIKE_TABLE_NAME,userThatDislike)
        console.log("Success")
        res.redirect('/admin/viewIdea')
    }
})

router.get('/viewIdea', async(req,res)=>{
    const results = await getAllDocumentFromCollection(IDEA_TABLE_NAME)
    res.render('admin/viewIdea',{'ideas':results})
})

///////////////////////////////////////////////////// COMMENT ////////////////////////////////////////////////////////////////////

router.get('/Idea',async (req, res) => {
    const id = req.query.id
    const objectId = ObjectId(id)
    const result = await getAnIdea(objectId)
    const name = result.idea
    const folderPath = __dirname.replace('\controllers','')+('/uploads/')
    res.sendFile(folderPath + name)
})

router.get('/submitComment', async (req, res) => {
    const id = req.query.id
    const objectId = ObjectId(id)
    const result = await getAnIdea(objectId)
    res.render('admin/submitComment',{idea: result})
})

router.get('/viewComment',async (req,res)=>{
    const id = req.query.id
    console.log(id)
    const result = await getIdeaFeedback(id)
    const objectId = ObjectId(id)
    console.log(objectId)
    const idea = await getAnIdea(objectId)
    res.render('admin/viewComment',{comments:result,idea:idea})
})

///////////////////////////////////////////////////// SET EVENT //////////////////////////////////////////////////////////////

router.get('/createEvent', async (req, res) =>{
    res.render('admin/createEvent')
})


router.get('/editEvent', async (req, res) =>{
    var id = req.query.id;
    var event = await getAEvent(id);
    res.render('admin/editEvent',{'event':event})
})

router.get('/viewEvent',async (req, res) =>{
    const results = await getAllDocumentFromCollection(EVENT_TABLE_NAME)
    res.render('admin/viewEvent',{'events':results})
})


module.exports = router;