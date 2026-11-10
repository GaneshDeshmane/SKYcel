import express from "express";
import cors from "cors"
import {simpleGit} from "simple-git"
import { generate } from "./generate";
import { Getpath } from "./paths";
const app = express()
app.use(cors())
app.use(express.json())
const git = simpleGit()
app.post('/upload',async function(req,res){
    try{
    const upload = req.body.upload
    const id = generate()
    if(!upload){
        return res.json({
            msg : `url is needed`
        })
    }
    await git.clone(upload,`output/${id}`)
    const files =Getpath(`output/${id}`)

    res.json({
        "msg" : `cloned successfully ${id}`,
        "respo" : files
    })
}catch(e){

}
})
app.listen(3000)