const express = require("express");
const bodyParser = require("body-parser");
const days = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require('lodash');

const app = express();

// Ejs shoul always be below app = express()
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");

const itemSchema = new mongoose.Schema({
  item: String,
});

const Item = mongoose.model("Item", itemSchema);

const item_1 = new Item({
  item: "Welcome to your todo list.",
});
const item_2 = new Item({
  item: "Hit the + button to add a new item",
});
const item_3 = new Item({
  item: "<-- Hit this to delete an item.",
});

var todo_default_items = [item_1, item_2, item_3];

const listSchema = {
  name: String,
  items: [itemSchema]
}

const List = mongoose.model("List", listSchema);

var Week_days = days.getDate();
app.get("/", function (req, res) {

  Item.find({})
    .then((result) => {
      if (result.length == 0) {
        Item.insertMany(todo_default_items);
      } else {
        res.render("list", { day_type: Week_days, todo: result });
      }
    })
    .catch((error) => {
      console.log("No Such Records");
    });
});

app.post("/", function (req, res) {
    if (req.body.todo != "") {
      const item_name = req.body.todo;
      const list_name = req.body.list;
      const item = new Item({
        item: item_name,
      });
      if(list_name === Week_days){
        item.save();
        res.redirect("/");
      } else {
      List.findOne({name:`${list_name}`})
      .then((result) => {
      if (result != null){
       result.items.push(item);
       result.save();
       res.redirect(`/${list_name}`)
      } 
    });
      }
    }
});



app.post("/delete", function (req, res) {
  const checked_item_id = req.body.check;
  const listName = req.body.listName;
  if(listName === Week_days){
    // Due to the await nature of mongoose we have to use then to simplify the code 
    Item.deleteOne({ _id: `${checked_item_id}` })
    .then((result) => {})
    .catch((error) => {
      console.log("No Such Records");
    });
    res.redirect("/")
  } 
    else {
      List.findOneAndUpdate({name: listName},{$pull: {items: {_id:checked_item_id}}})
      .then((result) => {
        res.redirect('/'+listName);
      })
      .catch((error) => {
        
      });
      res.redirect('/'+listName);
    }
  
});



app.get("/:custom_list_name", function (req, res) {
  const custom_list = _.lowerCase(req.params.custom_list_name);
  
  List.findOne({name:`${custom_list}`})
    .then((result) => {
      if (result == null){
        // Save the new list
        const list = new List({
          name: custom_list,
          items: todo_default_items
        });
        list.save();
        res.redirect(`/${custom_list}`);
      } else{
        // Display the list
        res.render("list", { day_type: `${custom_list}`, todo: result.items });
        
      }
    }); 
});



app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function (req, res) {
  console.log("Server is up and running on port 3000");
});
