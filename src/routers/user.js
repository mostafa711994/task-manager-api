const express = require('express')
const User = require('../models/user')
const router = new express.Router()
const auth = require('../middleware/auth')
const multer = require('multer')
const {sendWelcomeEmail,sendUserDeleteEmail} = require('../emails/account')
const upload = multer({

    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(png|jpg|jpeg)$/)){
           return cb( new Error('upload valid image'))
        }

        cb(undefined,true)
    }
})

router.post('/users/me/avatar', auth,upload.single('avatar') ,async (req,res) => {
    req.user.avatar = req.file.buffer
   await req.user.save()
        res.send()
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
})

router.delete('/users/me/avatar/delete',auth, async (req,res)=>{
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async (req,res)=>{
   try{
       const user = await User.findById(req.params.id)
       if(!user || !user.avatar){
           throw new Error()
       }
       res.set('Content-Type','image/jpg')
       res.send(user.avatar)
   }catch(e){
       res.status(400).send()
   }
})




router.post('/users',async (req,res) => {

    const user = new User(req.body)
    try{

        await user.save()
        sendWelcomeEmail(user.email,user.name)

        const token = await user.generateAuthToken()

        res.status(200).send({user,token})
    }catch (e) {
        console.log(e)
        res.status(400).send(e)
    }


})

router.post('/users/login',async function(req,res) {
    try{
        const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateAuthToken()
        res.send({user,token})

    }catch(e){
        res.status(400).send(e)

    }


})


router.post('/user/logout',auth,async (req,res)=>{
    
       try{
          req.user.token=[]
           await req.user.save()
               res.send()

       }catch (e) {
           res.status(500).send(e)

       }
})



router.get('/user/me',auth,async (req,res) => {
        res.send(req.user)

})



router.patch('/users/me',auth,async (req,res)=>{
    const updates = Object.keys(req.body)
    const requiredUpdates = ['name','email','password','age']
    const isValidOperations = updates.every((update)=>requiredUpdates.includes(update))
    if(!isValidOperations){
        res.status(400).send("error: Invalid updates")
    }
    try{

            updates.forEach((update)=> req.user[update] = req.body[update])

        await req.user.save()


        res.status(200).send(req.user)

    }catch (e) {
        res.status(500).send(e)

    }


})

router.delete('/users/me',auth,async (req,res)=>{
    try{
       await req.user.remove()
        sendUserDeleteEmail(req.user.email,req.user.name)
        res.status(200).send(req.user)

    }catch(e){
        res.status(500).send(e)

    }
})


module.exports = router