require('dotenv').config()
const mongoose = require('mongoose')
const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')

const authRoutes = require('./routes/auth')

const app = express()
//DB connection
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then( ()=> {
    console.log("DB CONNECTED")
});

// Middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true})); 
app.use(cookieParser())
app.use(cors())

//Routes
app.use('/api', authRoutes)

const port = process.env.PORT || 8000

app.listen(port, () => {
    console.log(`app is running at ${port}`)
})