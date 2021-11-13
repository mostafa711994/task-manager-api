const validator = require('validator')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const tasks  =require('./task')

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        unique:true,
        trim:true,
        required:true,
        dropDups: true,
        validate(value) {
            if(!validator.isEmail(value)){
                throw new Error('Email is not valid')
            }
        }
    },
    age:{
        type:Number,
        default:0,
        validate(value){
            if(value < 0){
                throw new Error('Age must be more than zero')
            }
        }
    },
    password:{
        type:String,
        minlength:7,
        trim:true,
        required: true

    },
    token:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type:Buffer
    }
},{
    timestamps:true
})

userSchema.pre('remove',async function (next) {
        const user = this
    await tasks.deleteMany({owner:user._id})
    next()
})

userSchema.virtual('tasks',{
    ref:'Task',
    localField: "_id",
    foreignField: "owner",
})


userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.token
    delete userObject.avatar
    return userObject
}



userSchema.methods.generateAuthToken = async function(){
        const user = this
    const token = await jwt.sign({_id:user.id.toString()},process.env.JWT_SECRET)
    user.token = user.token.concat({token})
    await user.save()

    return token
}




userSchema.statics.findByCredentials = async (email,password)=>{
    const user = await User.findOne({email})
    if(!user){
        throw new Error('unable to login')
    }

    const isMatch =  await bcrypt.compare(password,user.password)
       if(!isMatch){
           throw new Error('unable to login')

       }

       return user
}


// hash the password before saving the user
userSchema.pre('save',async function(next){
    const user = this
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8)
    }


    next()
})



const User = mongoose.model('User',userSchema)


module.exports = User