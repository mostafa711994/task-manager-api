const mongoose = require('mongoose')
const connection = process.env.MONGOOSE_DB_CONNECTION
mongoose.connect(connection,{
    useNewUrlParser:true,
    useCreateIndex:true,

})
