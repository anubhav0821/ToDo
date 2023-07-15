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


// Connecting to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");


//Creating the schema for the main default item list
const itemSchema = new mongoose.Schema({
  item: String,
});


// creating the collection in mongoDB
const Item = mongoose.model("Item", itemSchema);


// Three default items for the every list 
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


// Schema for the custom list that the user will be creating
const listSchema = {
  name: String,
  items: [itemSchema]
}


// Custom list collection creation in mongoDB
const List = mongoose.model("List", listSchema);

var Week_days = days.getDate();

// Home route
app.get("/", function (req, res) {


  //If the item in the collection does not exist, then the default is added to it with mongoose function.
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


//Adding the items to there respective lists
app.post("/", function (req, res) {
    if (req.body.todo != "") {
      const item_name = req.body.todo;
      const list_name = req.body.list;

      const item = new Item({
        item: item_name,
      });
//If the list title is the weekday, add it to the main list
      if(list_name === Week_days){
        item.save();
        res.redirect("/");
      }
// If the list name is one of the custom lists, add the item to the array for that list, using findOne and pusing the new item to its array.
      else {
      List.findOne({name:`${list_name}`})
      .then((result) => {
      if (result != null){
       result.items.push(item);
       result.save();
       res.redirect(`/${list_name}`)
      }});
      }
    }
});


// When user check the checkbox, it uses form to trigger the /delete route
//if the list name is the current day, then we call deleteOne mongoose function to search for that item and delete it.
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

// The list name is one of the custom list, then we find that list and go into its array of object to identify it with the unique id it has and update it with nothing
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


// If the uses tyles in a custom name, we check if tan list by that name already existe and if not then we create a new list with an arry populated with the default values
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