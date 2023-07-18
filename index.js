require("dotenv").config()
const express=require("express")
const cors=require("cors")
const connect=require("./Config/Config")
const VideoData = require("./models/VideoData.model")
const axios=require("axios")



const app=express()

app.use(express.json())
app.use(cors())

const apiKeys = process.env.YTapi ? JSON.parse(process.env.YTapi) : [];

let currentApiKeyIndex=0;  // starting the api from first index 


function getCurrentApiKey() {              // fuction to change the api key
    const apiKey = apiKeys[currentApiKeyIndex];
    currentApiKeyIndex = (currentApiKeyIndex + 1) % apiKeys.length;
    return apiKey;
  }


setInterval(async()=> // 10 sec interval storing the latest video in database
{
    const currentApiKey = getCurrentApiKey(); // changing api after every call
    const res=await axios.get(`https://www.googleapis.com/youtube/v3/search`,{params:{key:currentApiKey,q:"cricket",part: "snippet",maxResults:20,type:"video",order:"date",}})

    const video=res.data.items.map(item=>({title: item.snippet.title,
    description: item.snippet.description,
    publishedDate: item.snippet.publishedAt,
    thumbnails: item.snippet.thumbnails,})) 

    await VideoData.insertMany(video);

},10000)



 



app.get("/",(req,res)=>
{

    res.send("Welecome to server")
})


app.get("/getVideo",async(req,res)=>   // get video in discending order of date from data base
{

    

     try
     {
        const page=req.query.page || 1

        const totalCount = await VideoData.countDocuments();
        const totalPage = Math.ceil(totalCount / 10);

        const videoData=await VideoData.find().sort({ publishedDate: -1 }).skip((page - 1) * 10).limit(10);

        res.send({videoData,currentPage:page,totalPage:totalPage})
     }
     catch(e)
     {
        res.send(`error ${e.message}`);
     }
  
})


app.get("/searchVideo",async(req,res)=>  // search get method for title or description
{

    

     try
     {
        const query = req.query.query;


        const videoData=await VideoData.find({$or: [{ title: { $regex: query, $options: "i" } }, { description: { $regex: query, $options: "i" } } ]})

        res.send(videoData)
     }
     catch(e)
     {
        res.send(`error ${e.message}`);
     }
  
})






app.listen(process.env.PORT,async()=>
{
    await connect
    console.log("Server started")
})