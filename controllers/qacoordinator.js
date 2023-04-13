const express = require('express')
const async = require('hbs/lib/async')
const router = express.Router()
const {insertObject,checkUserRole,USER_TABLE_NAME,IDEA_TABLE_NAME,getAllDocumentFromCollection} = require('../databaseHandler')



//GET

router.get('/viewIdea', async (req, res) => {
    const results = await getAllDocumentFromCollection(IDEA_TABLE_NAME)
    res.render('viewIdea',{ideas:results})
})



module.exports = router;