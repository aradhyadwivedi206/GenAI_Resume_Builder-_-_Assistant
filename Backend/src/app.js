const express=require('express');
const cookieParser=require("cookie-parser")
const app=express()
const cors=require("cors")

app.use(express.json())
app.use(cookieParser())
// app.use(cors({
//     origin:"https://gen-ai-resume-builder-assistant-omega.vercel.app",credentials:true
// }))

const allowedOrigins = [
    "http://localhost:5173",
    "https://gen-ai-resume-builder-assi-git-b416b2-aradhya-dwivedis-projects.vercel.app",
    "https://gen-ai-resume-builder-assistant-6knylcswj.vercel.app"
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
// require all the routes here
const authRouter=require('./routes/auth.routes')
const interviewRouter=require('./routes/interview.routes')
// using all the routes here
app.use("/api/auth",authRouter)
app.use("/api/interview",interviewRouter)

module.exports=app