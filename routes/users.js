const express = require("express");
const bcrypt = require("bcrypt");
const { UserModel, userValidate, loginValidate, createToken } = require("../models/userModel");
const { auth, authAdmin } = require("../middlewares/auth");
const router = express.Router();

router.get("/",async(req,res) => {
    res.json({msg:"Users endpoint"});
  })
  
  router.get("/list",authAdmin,async(req,res) => {
    try {
      const limit = 10;
      const skip = req.query.skip || 0;
      const data = await UserModel
      .find({},{password:0})
      .limit(limit)
      .skip(skip)
      res.json(data);  
    } 
    catch (error) {
      console.log(error);
      res.status(502).json({err:"There problem come back later"})
    }
  })
  
  
  router.get("/info", auth,async(req,res) => {
    try{
      const data = await UserModel.findOne({_id:req.tokenData._id},{password:0})
      res.json(data)
    }
    catch (error) {
      console.log(error);
      res.status(502).json({err:"There problem comeback later"})
    }
  })
  
  
  router.post("/",async(req,res) => {
    const validBody = userValidate(req.body);
    if(validBody.error){
      return res.status(400).json(validBody.error.details)
    }
    try{
      const user = new UserModel(req.body);
      user.password = await bcrypt.hash(user.password,10);
      await user.save();
      user.password = "*****"
      res.status(201).json(user)
    }
    catch (error) {
      if(error.code == 11000){
        return res.status(400).json({err:"Email already in system",code:11000})
      }
      console.log(error);
      res.status(502).json({err:"There problem come back later"})
    }
  })
  
  router.post("/login",async(req,res) => {
    const validBody = loginValidate(req.body);
    if(validBody.error){
      return res.status(400).json(validBody.error.details)
    }
    try{
      const user = await UserModel.findOne({email:req.body.email})
      if(!user){
        return res.status(401).json({msg:"Email or password not correct!"})
      }
      const passwordValidate = await bcrypt.compare(req.body.password,user.password)
      if(!passwordValidate){
        return res.status(401).json({msg:"Email or password not correct!"})
      }
     
      const token = createToken(user._id,user.role);
      res.json({token})
    }
    catch (error) {
      console.log(error);
      res.status(502).json({err:"There problem come back later"})
    }
  })
  
  router.patch("/role/:id/:role", authAdmin, async(req,res) => {
    try{
      const id = req.params.id;
      const role = req.params.role;
      const data = await UserModel.updateOne({_id:id},{role:role})
      res.json(data);
    }
    catch (error) {
      console.log(error);
      res.status(502).json({err:"There problem come back later"})
    }
  })
  
  module.exports = router;