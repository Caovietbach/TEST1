const express = require('express')
const async = require('hbs/lib/async')
const path = require('path')
const fs = require('fs')
const {ObjectId} = require('bson')
const router = express.Router()
const {getDB,insertObject,getAccount,getAllDocumentFromCollection,getAnAccount,updateAccount,
    getIdeaFeedback, getAEvent, editEvent, checkUserDepartment,searchCoordinator,
    checkUserRole,checkUserLogin,updateIdeaLikeCount,getAnIdea,checkCategory, checkUserLike, 
    checkUserDislike,checkUserEmail, checkExistEmail,searchIdeaByCategory, searchIdeaByEvent,
    EVENT_TABLE_NAME,USER_TABLE_NAME,IDEA_TABLE_NAME,CATEGORY_TABLE_NAME,ROLE_TABLE_NAME,
    DEPARTMENT_TABLE_NAME,POSTLIKE_TABLE_NAME,POSTDISLIKE_TABLE_NAME,COMMENT_TABLE_NAME} = require('../databaseHandler');



function requiresLoginQacoordinator(req,res,next){
    if(req.session.user){
        if(req.session.user.role != "Staff"){
            res.redirect('/login');
        }
        return next()
    }else{
        res.redirect('/login')
    }
}

//POST




router.post('/submitComment',requiresLoginQacoordinator, async (req,res)=>{
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
    req.session.save(() => {
        res.redirect('/qacoordinator/viewIdea')
    })
})



//GET

router.get('/likeIdea',requiresLoginQacoordinator, async (req, res) => {
    const id = req.query.id
    const objectId = ObjectId(id)
    var userEmail = req.session.user.email
    const testLike = await checkUserLike(objectId,userEmail)
    const testDislike = await checkUserDislike(objectId,userEmail)
    console.log(testLike)
    console.log(testDislike)
    if (testLike == 1){
        req.session.save(() => {
            res.redirect('/qacoordinator/viewIdea')
        })
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
        await dbo.collection(POSTDISLIKE_TABLE_NAME).deleteOne({ideaID: objectId, userEmail: userEmail})
        await insertObject(POSTLIKE_TABLE_NAME,userThatLike)
        console.log("Success")
        req.session.save(() => {
            res.redirect('/qacoordinator/viewIdea')
        })
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
        req.session.save(() => {
            res.redirect('/qacoordinator/viewIdea')
        })
    }
})

router.get('/dislikeIdea',requiresLoginQacoordinator, async (req, res) => {
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
        req.session.save(() => {
            res.redirect('/qacoordinator/viewIdea')
        })
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
        await dbo.collection(POSTLIKE_TABLE_NAME).deleteOne({ideaID: objectId, userEmail: userEmail})
        await insertObject(POSTDISLIKE_TABLE_NAME,userThatDislike)
        console.log("Success")
        req.session.save(() => {
            res.redirect('/qacoordinator/viewIdea')
        })
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
        req.session.save(() => {
            res.redirect('/qacoordinator/viewIdea')
        })
    }
})

router.get('/Idea', requiresLoginQacoordinator,async (req, res) => {
    const id = req.query.id
    const objectId = ObjectId(id)
    const result = await getAnIdea(objectId)
    const name = Date(Date.now()) + "-" + result.idea
    const folderPath = __dirname.replace('\controllers','')+('/uploads/')
    res.sendFile(folderPath + name)
})

router.get('/submitComment', requiresLoginQacoordinator, async (req, res) => {
    const id = req.query.id
    const objectId = ObjectId(id)
    const result = await getAnIdea(objectId)
    if (req.session.error.msg != null) {
        var ErrorMessage = req.session.error.msg
    }
    res.render('qacoordinator/submitComment',{idea: result, ErrorMessage: ErrorMessage})
    req.session.error.msg = null
})

router.get('/newIdea', requiresLoginQacoordinator, async (req,res)=>{
    const category = await getAllDocumentFromCollection(CATEGORY_TABLE_NAME)
    const event = await getAllDocumentFromCollection(EVENT_TABLE_NAME)
    if(req.session.error.msg != null){
        var ErrorMessage = req.session.error.msg
    }
    res.render('qacoordinator/newIdea',{categories:category,events:event,ErrorMessage:ErrorMessage})
    req.session.error.msg = null
})

router.get('/home', requiresLoginqacoordinator,(req,res)=>{
    res.render('qacoordinator/home')
})

router.get('/viewComment', requiresLoginqacoordinator,async (req,res)=>{
    const id = req.query.id
    const result = await getIdeaFeedback(id)
    const objectId = ObjectId(id)
    const idea = await getAnIdea(objectId)
    res.render('qacoordinator/viewComment',{comments:result,idea:idea})
})

router.get('/viewIdea',requiresLoginqacoordinator, async (req, res) => {
    const results = await getAllDocumentFromCollection(IDEA_TABLE_NAME)
    if (req.session.error.msg != null){
        res.render('qacoordinator/viewIdea',{ideas:results,ErrorMsg:req.session.error.msg})
    } else {
        res.render('qacoordinator/viewIdea',{ideas:results})
    }
})

router.post('/viewSort', async (req, res)=>{
    const input = req.body.Input
    const checkC = await searchIdeaByCategory(input)
    const checkE = await searchIdeaByEvent(input)
    if (checkC != -1 && checkE == -1){
        console.log(checkC)
        res.render('qacoordinator/viewIdea',{ideas:checkC})
    } else if (checkC == -1 & checkE != -1){
        console.log(checkE)
        res.render('qacoordinator/viewIdea',{ideas:checkE})
    } else {
        req.session.error.msg = "There are no such category or event"
        res.redirect('/qacoordinator/viewIdea')
    }
})



module.exports = router;