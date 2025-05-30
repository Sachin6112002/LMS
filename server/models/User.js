import mongoose from "mongoose";

// Ensure publicMetadata is a subdocument for role
const userSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    imageUrl: { type: String, required: true },
    password: { type: String, required: false },
    enrolledCourses: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
        default: []
    },
    publicMetadata: {
        type: {
            role: { type: String, default: 'student' },
            // ...other metadata fields...
        },
        default: () => ({ role: 'student' })
    },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User