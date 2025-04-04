import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
    {
        _id: {type: String , requires : true},
         name: {type: String , requires : true},
        email: {type: String , requires : true},
        imageUrl : {type: String , requires : true},
       enrolledCourses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref : 'Course'
        }
       ],
    }, 
    {timestamps: true}
);
const User = mongoose.model('User',userSchema);
export default User