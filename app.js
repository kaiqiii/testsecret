//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser:true, useUnifiedTopology:true}); //to connect to our mongodb

const userSchema = new mongoose.Schema ({ //Need to type it like that in order to use the encryption mod.
  email: String,
  password:String
});

// (Moved to .env file) const secret = "Thisisourlittlesecret."
//Important to add encrypt package as plugin before creating the user model.
userSchema.plugin(encrypt,{secret:process.env.SECRET, encryptedFields: ["password"] });  //If we don't add in the encryptedFields part, this line will encrypt the entire database.

const User = new mongoose.model("User",userSchema); //Creating a model


app.get("/",function(req,res){
  res.render("home");
});

app.get("/login",function(req,res){
  res.render("login");
});

app.get("/register",function(req,res){
  res.render("register");
});

app.get("/logout",function(req,res){
  res.render("home")
});

app.post("/register",function(req,res){
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });

  newUser.save(function(err){
    if (err) {
      console.log(err);
    } else {
      res.render("secrets"); //should only render the secrets page after the person logs in.
    }
  });
});

app.post("/login",function(req,res){
  const username=  req.body.username;
  const password = req.body.password;
  User.findOne({email:username},function(err,foundUser) { //email from the database, username is the email keyed in by the user
    if (err) {
      console.log(err);
    } else {
      if (foundUser){ //if user with the keyed in email exists,
        if(foundUser.password === password){
          res.render("secrets");
        }
      }
    }
  });
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
