const mongoose=require('mongoose');


mongoose.connection.on('error',(err)=>{

    console.log(`could not connect to DB, following error occured: ${err}`);

});


async function connectDB(url)
{
    return mongoose.connect(url);

}



module.exports=connectDB;