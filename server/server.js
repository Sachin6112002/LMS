import  express from "express"
import cors from 'cors'
import 'dotenv/config'
import connectDB from "./configs/mongodb.js";
import { clerkWebhooks } from "./controllers/webhooks.js";

const app = express()
app.use(cors())
await connectDB()
app.get('/', (req, res) => res.send("API is working"))
const PORT = process.env.PORT || 3000
app.post('/clerk', express.json(), clerkWebhooks)
app.listen(PORT , ()=>{
    console.log("welcome to my new server ");
    
})
