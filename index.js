const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const mongoose=require("mongoose")
const _=require("lodash")

app.use(bodyParser.urlencoded({extended:true}))
app.set("view engine","ejs")
app.use(express.static("public"))
mongoose.connect("mongodb+srv://admin-sourav:test123@@cluster0.j7b4s.mongodb.net/todolistDB",{ useUnifiedTopology: true ,useNewUrlParser: true,useFindAndModify: false })

const itemsSchema={
    name:String
}
const Item=mongoose.model("Item",itemsSchema)
const listSchema={
    name:String,
    lists:[itemsSchema]
}
const List=mongoose.model("List",listSchema)
const item1={
    name:"Welcome to your todolist!"
}
const item2={
    name:"Hit the + button to add item"
}
const item3={
    name:"<-- Hit this to delete an item"
}
const defaultItems=[item1,item2,item3]
app.get("/",(req,res)=>{
    const today=new Date()
    const options={
        weekday:"long",
        day:"numeric",
        month:"long" 
    }
    const day=today.toLocaleDateString("en-US",options)
    Item.find({},(err,newItems)=>{
        if(newItems.length===0){
            Item.insertMany(defaultItems,(err)=>{
                if(err){
                    console.log(err)
                }
            })
            res.redirect("/")
        }else{
        res.render("list",{
            listTitle:day,
            newItems:newItems
        })
    }
    }) 
    
})

app.post("/",(req,res)=>{
    const item = req.body.newItem
    const title = req.body.title
    const today=new Date()
    const options={
        weekday:"long"
    }
    const day=today.toLocaleDateString("en-US",options)

    if(title===(day+",")){
        const formItem=new Item({
            name:item
        })
        formItem.save()
        res.redirect("/")
    }
    else{
        const formItem=Item({
            name:item
        })
        List.findOne({name:title},(err,foundList)=>{
            foundList.lists.push(formItem)
            foundList.save()
        })
        res.redirect("/"+title)
    }
})

app.post("/delete",(req,res)=>{
    const itemId=req.body.checkbox
    const listTitle=req.body.listName
    const today=new Date()
    const options={
        weekday:"long",
        day:"numeric",
        month:"long" 
    }
    const day=today.toLocaleDateString("en-US",options)
        if(listTitle===day){
            Item.deleteOne({_id:itemId},(err)=>{
                if(err){
                    console.log(err);
                }
                else{
                    res.redirect("/")
                }
            })
        }
        else{
            List.findOneAndUpdate({name:listTitle},{$pull:{lists:{_id:itemId}}},(err,foundList)=>{
                if(err){
                    console.log(err)
                }
                else{
                    res.redirect("/"+listTitle)
                }
            })
        }
    })
    
app.get("/:customList",(req,res)=>{
    const customListName=_.capitalize(req.params.customList)
    List.findOne({name:customListName},(err,result)=>{
        if(!err){
            if(result){
                res.render("list",{
                    listTitle:customListName,
                    newItems:result.lists
                })
            }
            else{
                const list=new List({
                    name:customListName,
                    lists:defaultItems
                })
                list.save()
                res.redirect("/"+customListName)
            }
        }
    })

})

app.listen(3000,()=>{
    console.log("Server started at 3000");
})