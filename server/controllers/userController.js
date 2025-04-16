import User from "../models/User.js"


export const getUserData = async (req  , res) => {
    try {
        console.log("req.auth ->", req.auth)

       const userId = req.auth.userId
       console.log(`userID -> ${userId}`);
       
        const user = await User.findById(userId)
        console.log(`user -> ${user}`);

        if (!user) {
            return res.json({success : false , message : 'User Not Found '})

        }
    res.json({success: true , user})
    }
    catch (error){
        res.json({success: false , message : error.message})
    }
  
}
//Users Enrolled Courses with Lecture Links 
export const userErolledCourses = async (req ,res) =>{
    try{
        const userId = req.auth.userId 
        const userData = await User.findById(userId).populate('enrolledCourses')
        res.json({success : true , enrolledCourses: userData.enrolledCourses})

    }
    catch(error){
        res.json({ success : false , message : error.message})
    }
}