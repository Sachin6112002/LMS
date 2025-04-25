import mongoose from "mongoose";

const courseProgressSchema = new mongoose.Schema({
    userId : { type : string , required : true},
    courseId : { type : string , required : true},
    completed: { type : string , default : false},
    lectureCompleted : []
}, {
    minimize: false
})
export const CourseProgress = mongoose.model('CourseProgress' , courseProgressSchema)