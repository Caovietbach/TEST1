const express = require('express')
const async = require('hbs/lib/async')
const router = express.Router()
const {insertObject,checkCategory,USER_TABLE_NAME,CATEGORY_TABLE_NAME,IDEA_TABLE_NAME} = require('../databaseHandler')


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


//GET

router.get('/home',(req,res)=>{
    res.render('qamanager/home')
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

router.get('/viewIdea', async (req, res) => {
    const results = await getAllDocumentsFromCollection(IDEA_TABLE_NAME)
    res.render('qamanager/viewIdea',{idea:results})
})


module.exports = router;