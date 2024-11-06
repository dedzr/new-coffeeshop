const http=require('http');
const app=require('./app');
const connectDB = require('./database/connect-database');

require('dotenv').config();



const server=http.createServer(app);
const PORT=process.env.PORT || 5000;


async function startServer(){

    await connectDB(process.env.MONGO_URL);

    console.log(`MongoDB server started`);


    server.listen(PORT,()=>{
        console.log(`Server started on PORT ${PORT}`);
    });

}



startServer();




