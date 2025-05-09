import { clerkClient } from "@clerk/express";
// Middeware {Protect Education Routes }
const protectEducator = async (req, res , next)=>{
    try{
        const userId = req.auth
        const response = await clerkClient.users.getUser(userId)
        if(response.publicMetadata.role !== 'educator'){
            return res.json({success:false , message : 'Unauthorized Accesss'})
        }
        next()
    }
    catch(error){
        res.json({success:false, message:error.message})
    }
}
export default protectEducator;