require('dotenv').config()
const mongoose = require('mongoose')
const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')


const app = express()
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then( ()=> {
    console.log("DB CONNECTED")
});

app.use(express.json());
app.use(express.urlencoded({extended: true})); 
app.use(cookieParser())
app.use(cors())

const port = process.env.PORT || 8000

app.listen(port, () => {
    console.log(`app is running at ${port}`)
})