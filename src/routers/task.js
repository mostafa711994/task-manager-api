const express = require('express')
const Task = require('../models/task')
const router = new express.Router()
const auth = require('../middleware/auth')




router.get('/tasks',auth,async (req,res) => {

    const match = {}
  const sort = {}
    if(req.query.completed){
        match.completed = req.query.completed
    }

    if(req.query.sortBy){
       const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc'? -1:1
    }

    console.log(sort)

    try{
        // const tasks = await Task.find({owner:req.user._id,...match,...options})
         await req.user.populate({
            path:'tasks',
            match,
            options :{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            },

        }).execPopulate()
        res.status(200).send(req.user.tasks)
    }catch (e) {
        res.status(500).send(e)
    }


})
router.get('/task/:id',auth,async (req,res) => {

    const _id = req.params.id

    try{
        //const task = await Task.findById(_id)

        const task = await Task.findOne({_id,owner:req.user._id})
        if(!task){
            res.status(404).send()

        }

        res.status(200).send(task)
    }catch (e) {
        res.status(500).send()
    }

})




router.post('/tasks',auth,async (req,res) => {

   // const task = new Task(req.body)

    const task = new Task({
        ...req.body,
        owner:req.user._id
    })


    try{
        await task.save()
        res.status(200).send(task)

    }catch(e){
        res.status(400).send(e)

    }
})

router.patch('/tasks/:id',auth,async (req,res)=>{
    const updates = Object.keys(req.body)
    const requiredUpdates = ['description','completed']
    const isValidOperations = updates.every((update)=>requiredUpdates.includes(update))
    if(!isValidOperations){
        res.status(400).send("error: Invalid updates")
    }
    const _id = req.params.id
    try{

        const task = await Task.findOne({_id,owner:req.user._id})
        if(!task){
            res.status(404).send('task not found')
        }
        updates.forEach((update)=> task[update] = req.body[update])

        await task.save()


        res.status(200).send(task)

    }catch (e) {
        res.status(400).send('failed')

    }


})

router.delete('/tasks/:id',auth,async (req,res)=>{
    try{
           const _id = req.params.id
        const task = await Task.findOneAndDelete({_id,owner:req.user._id})
        if(!task){
            res.status(404).send('task not found')

        }
        res.status(200).send(task)

    }catch(e){
        res.status(500).send(e)

    }
})

module.exports = router