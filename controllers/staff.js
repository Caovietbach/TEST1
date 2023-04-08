const express = require('express')
const async = require('hbs/lib/async')
const path = require('path')
const fs = require('fs')
const {ObjectId} = require('bson')
const multer = require("multer");
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/")
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    },
})
const uploadStorage = multer({ storage: storage })
const router = express.Router()
const {getDB,insertObject,getAccount,getAllDocumentFromCollection,getAnAccount,updateAccount, getIdeaFeedback, getAEvent,
    checkUserRole,checkUserLogin,updateIdeaLikeCount,getAnIdea,checkCategory, checkUserLike, checkUserDislike,checkUserEmale,
    EVENT_TABLE_NAME,USER_TABLE_NAME,IDEA_TABLE_NAME,CATEGORY_TABLE_NAME,ROLE_TABLE_NAME,DEPARTMENT_TABLE_NAME,POSTLIKE_TABLE_NAME,POSTDISLIKE_TABLE_NAME,COMMENT_TABLE_NAME} = require('../databaseHandler');




// POST






router.post('/newIdea',uploadStorage.single("myFile"), async (req,res)=>{
    const fileName = res.req.file.filename
    console.log(fileName)
    const author = req.session.user.userName
    const authorEmail = req.session.user.email
    const likeCount = 0
    const category = req.body.Category
    const event = req.body.Event
    const eventId = ObjectId(event)
    console.log(event)
    const Anon = req.body.Anon
    const realTime = new Date().getTime() 
    const e = await getAEvent(eventId)
    const eDate = new Date(e.endDate).getTime()

    if (realTime > eDate){
        req.session.error = "The event is passed"
        res.redirect('/staff/newIdea')
        console.log("1")
        const directoryPath = __dirname.replace('\controllers','')+('/uploads/')
        fs.unlink(directoryPath + fileName, (err) => {
            if (err) {
                throw err;
            }
        
            console.log("File is taken down.");
        });
    } else {
        const idea = fileName
        if (Anon == "Yes"){
            const objectToInsert = {
                'idea': idea,
                'author': "Guest",
                'email' : authorEmail,
                'user': author,
                'likeCount':likeCount,
                'category': category,
                'event': e.name
            }
            insertObject(IDEA_TABLE_NAME,objectToInsert)
            res.redirect('/staff/viewIdea')
        } else {
            const objectToInsert = {
                'idea': idea,
                'author':author,
                'email' : authorEmail,
                'user': author,
                'likeCount':likeCount,
                'category': category,
                'event': e.name
            }
            insertObject(IDEA_TABLE_NAME,objectToInsert)
            res.redirect('/staff/viewIdea')
        }
    }

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
    res.redirect('/staff/viewIdea')
})



//GET

router.get('/likeIdea', async (req, res) => {
    const id = req.query.id
    const objectId = ObjectId(id)
    var userEmail = req.session.user.email
    const testLike = await checkUserLike(objectId,userEmail)
    const testDislike = await checkUserDislike(objectId,userEmail)
    if (testLike == 1){
        req.session.save()
        res.redirect('/staff/viewIdea')
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
        req.session.save()
        res.redirect('/staff/viewIdea')
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
        req.session.save()
        res.redirect('/staff/viewIdea')
    }
})

router.get('/dislikeIdea', async (req, res) => {
    const id = req.query.id
    console.log(id)
    const objectId = ObjectId(id)
    var userEmail = req.session.user.email
    console.log(userEmail)
    const testDislike = await checkUserDislike(objectId,userEmail)
    const testLike = await checkUserLike(objectId,userEmail)
    console.log(testDislike)
    console.log(testLike)
    if (testDislike == 1) {
        req.session.save()
        res.redirect('/staff/viewIdea')
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
        req.session.save()
        res.redirect('/staff/viewIdea')
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
        req.session.save()
        res.redirect('/staff/viewIdea')
    }
})




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
    res.render('staff/submitComment',{idea: result})
})
router.get('/newIdea',async (req,res)=>{
    const category = await getAllDocumentFromCollection(CATEGORY_TABLE_NAME)
    const event = await getAllDocumentFromCollection(EVENT_TABLE_NAME)
    res.render('staff/newIdea',{categories:category,events:event})
})

router.get('/home',(req,res)=>{
    res.render('staff/home')
})

router.get('/viewComment',async (req,res)=>{
    const id = req.query.id
    console.log(id)
    const result = await getIdeaFeedback(id)
    res.render('staff/viewComment',{comments:result})
})

router.get('/viewIdea', async (req, res) => {
    const results = await getAllDocumentFromCollection(IDEA_TABLE_NAME)
    res.render('staff/viewIdea',{ideas:results})
})




module.exports = router;