const express = require("express");
const bodyParser = require("body-parser");
const days = require(__dirname+"/date.js")


const app = express();

// Ejs shoul always be below app = express()
app.set("view engine", "ejs");


app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));



var todo = ["Bye food", "Cook food", "Do exercise"];
var work = [];

app.get("/", function (req, res) {

  var Week_days = days.getDate();
  res.render("list", { day_type: Week_days, todo: todo });
});

app.post("/", function (req, res) {

    if (req.body.list === "Work"){
      if(req.body.todo !=""){
        work.push(req.body.todo);
      }
      res.redirect("/work");
    }else {
      if(req.body.todo !=""){
    todo.push(req.body.todo);
      }
    res.redirect("/");
    }

});



app.get("/work", function(req,res){
  res.render("list", { day_type: "Work List", todo: work });
})




app.get("/about", function(req,res){
  res.render("about")
})





app.listen(3000, function (req, res) {
  console.log("Server is up and running on port 3000");
});