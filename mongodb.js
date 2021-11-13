const {MongoClient, ObjectID} = require('mongodb')

const connectionURl = 'mongodb://127.0.0.1:27017'
const databaseName = 'task-manager'

MongoClient.connect(connectionURl,{useNewUrlParser : true}, (error,client)=>{
        if(error){
            console.log('unable to connect to database')
        }

        const db = client.db(databaseName)


        // db.collection('tasks').findOne({_id:new ObjectID("616c8e607d135c240487a368")},(error,task)=>{
        //     if(error){
        //         console.log('unable to fetch')
        //     }
        //     console.log(task)
        // })

        // db.collection('tasks').find({completed: false}).toArray((error,task)=>{
        //     if(error){
        //                 console.log('unable to fetch')
        //     }
        //
        //     console.log(task)
        //
        // })


        db.collection('tasks').deleteOne({
                description:''

        }).then((result)=>{
            console.log(result)
        }).catch((error)=>{
            console.log(error)
        })


})