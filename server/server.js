import express from "express"
import cors from 'cors'
import 'dotenv/config'
import connectDB from "./configs/mongodb.js";
import { clerkWebhooks } from "./controllers/webhooks.js";
const PORT = process.env.PORT || 5000
const app = express()
app.use(cors())
await connectDB()
app.get('/', (res , req) => res.send("API is working"))
app.post('/clerk', express.json(), clerkWebhooks)
app.listen(PORT , ()=>{
    console.log("welcome to my new server ");
    
})
