const express = require('express')
const async = require('hbs/lib/async')
const fs = require('fs')
const router = express.Router()
const admZip = require('adm-zip')
const path = require('path')
const Chart = require('chart.js')
const {getDB,insertObject,getAccount,getAllDocumentFromCollection,getAnAccount,updateAccount, getIdeaFeedback, getAEvent,
    checkUserRole,checkUserLogin,updateIdeaLikeCount,getAnIdea,checkCategory, checkUserLike, checkUserDislike,checkUserEmale,
    EVENT_TABLE_NAME,USER_TABLE_NAME,IDEA_TABLE_NAME,CATEGORY_TABLE_NAME,ROLE_TABLE_NAME,DEPARTMENT_TABLE_NAME,POSTLIKE_TABLE_NAME,POSTDISLIKE_TABLE_NAME,COMMENT_TABLE_NAME} = require('../databaseHandler')
const ObjectsToCsv = require('objects-to-csv')
const {ObjectId} = require('bson')


function requiresLoginQAmanager(req,res,next){
    if(req.session.user){
        if(req.session.user.role != "QAManager"){
            res.redirect('/login');
        }
        return next()
    }else{
        res.redirect('/login')
    }
}



//POST

router.post('/addCategory', async (req, res) => {
    const nameInput = req.body.txtName
    const check = await checkCategory(nameInput)
    if (nameInput.length == 0){
        const errorMessage = "The loai phai co ten!";
        res.render('qamanager/newCategory',{errorName:errorMessage})
        console.log("1")
        return;
    } else if (check==1) {
        const errorMessage = "The loai nay da co!"
        const oldValues = {description:descriptionInput}
        res.render('qamanager/newCategory',{errorDuplicate:errorMessage,oldValues:oldValues})
        console.log("2")
        return;
    }
    else {
        const newC = {name:nameInput}
        await insertObject(CATEGORY_TABLE_NAME,newC)   
        res.redirect('qamanager/viewCategory')
    }
})

router.post('/submitComment',requiresLoginQAmanager, async (req,res)=>{
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
        res.redirect('/qamanager/viewIdea')
    })
})

router.post('/viewChart', async (req, res) => {
    req.session.error.msg = null
    const event = req.body.Event
    const objectId = ObjectId(event)
    const e = await getAEvent(objectId)
    const choice = req.body.Choice
    if(choice == 0){
        req.session.error.msg = "Please select a choice"
        res.redirect('/qamanager/viewChart')
    } else if(choice == 1){
        

    } else if(choice == 2){

    } else if(choice == 3){

    } else {
        console.log("Error")
    }

})

//GET

router.get('/home',requiresLoginQAmanager,(req,res)=>{
    res.render('qamanager/home')
})

router.get('/downloadCsv',requiresLoginQAmanager, async (req, res) => {
    const data = await getAllDocumentFromCollection(IDEA_TABLE_NAME)
    const csv = new ObjectsToCsv(data)
    const folderPath = __dirname.replace('\controllers','')+('/downloads/test.csv')
    await csv.toDisk(folderPath)
    res.download(folderPath),() => {
        fs.unlinkSync(folderPath)
    }
    console.log("Download Succeed")
})

router.get('/downloadZip',requiresLoginQAmanager, async (req, res) => {
    const zip = new admZip()
    const folderPath = (__dirname.replace('\controllers','')+ ('/uploads'))
    const out = ('./downloads/data.zip')
    
    fs.readdir(folderPath, (err, files) => {
        if (err)
            console.log(err);
        else {
            files.forEach(file => {
                p = path.join(folderPath, file)
                zip.addLocalFile(p,out)
                fs.writeFileSync(out, zip.toBuffer())
            })
        }
    })
    res.download(out),() => {
        fs.unlink(out)
    }
})

router.get('/Idea', requiresLoginQAmanager, async (req, res) => {
    const id = req.query.id
    const objectId = ObjectId(id)
    const result = await getAnIdea(objectId)
    const name = result.idea
    const folderPath = __dirname.replace('\controllers','')+('/uploads/')
    res.sendFile(folderPath + name)
})

router.get('/viewCategory', async(req, res) => {
    const results = await getAllDocumentsFromCollection(CATEGORY_TABLE_NAME)
    res.render('qamanager/viewCategory',{category:results})
})

router.get('/addCategory', async (req, res) => {
    res.render('qamanager/addCategory')
})

router.get('/deleteCategory', async (req, res) => {
    const id = req.query.id
    await deleteDocumentById(CATEGORY_TABLE_NAME, id)
    res.redirect('qamanager/viewCategory')
})
router.get('/viewComment', requiresLoginQAmanager,async (req,res)=>{
    const id = req.query.id
    const result = await getIdeaFeedback(id)
    const objectId = ObjectId(id)
    const idea = await getAnIdea(objectId)
    res.render('qamanager/viewComment',{comments:result,idea:idea})
})

router.get('/viewIdea', async (req, res) => {
    const results = await getAllDocumentFromCollection(IDEA_TABLE_NAME)
    res.render('qamanager/viewIdea',{ideas:results})
})

router.get('/viewChart',async (req, res) => {
    const events = await getAllDocumentFromCollection(EVENT_TABLE_NAME)
    res.render('qamanager/viewChart',{event: events})
})

module.exports = router