//jshint esversion:6

//deployed version can be found at https://intense-waters-56075.herokuapp.com/
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));


mongoose.connect(process.env.DB_login, {
  useNewURLParser: true
});


const itemSchema = {
  name: String
};

const listSchema = {
  name: String,
  items: [itemSchema]
}


const List = mongoose.model("List", listSchema);
const Item = mongoose.model("Item", itemSchema);


const defaultItems = [{name:"Add a task to the list."}];



app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("database updated successfully");
        }
      });
      res.redirect("/");
    } else {

      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });

    }

  });
});



app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const length = Item.count();
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });
  if (listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName} , function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }




});

app.post("/delete", function(req, res) {
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today"){
    Item.findByIdAndRemove({
      _id: checkedItem
    }, function(err) {
      if (!err) {
        console.log("database successfully updated");
        res.redirect("/");
      }
    });

  }else{
    List.findOneAndUpdate(
      {name:listName}, {$pull: {items: {_id: checkedItem}}}, function(err, foundList){
        if(!err){
          res.redirect("/"+ listName);
          //console.log(err);
        }

      }
    );
  }


});









app.get("/:listID", function(req, res) {
  const listName = _.capitalize(req.params.listID);
  List.findOne({
    name: listName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: listName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+listName);
      } else {
        //show existing list
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });

      }
    }
  });



})









app.get("/about", function(req, res) {
  res.render("about");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, function() {
  console.log("Server started on ${ PORT }");
});
