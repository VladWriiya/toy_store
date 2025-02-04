const express = require("express");
const { ToyModel, validateToy } = require("../models/toyModel");
const { auth } = require("../middlewares/auth");
const router = express.Router();

router.get("/", async(req,res) => {
    const limit = 10;
    const skip = req.query.skip || 0;
    const sort = req.query.sort || "_id";
    const reverse = req.query.reverse == "yes" ? -1 : 1;
    const category = req.query.category;
    const searchQ = req.query.s
    const findFilter = {}

    if(category){
      findFilter.category = category;
    } 
    if(searchQ) {
        const searchExp = new RegExp(searchQ,"i")
        findFilter.$or = [{name: searchExp},{info: searchExp}]
    }
  try{
    const data = await ToyModel
    .find(findFilter)
    .limit(limit)
    .skip(skip)
    .sort({[sort]: reverse})
    res.json(data);
  }
  catch(err){
    console.log(err);
    res.status(502).json({err})
  }
})

router.get("/prices", async(req,res) => {
  try {
    const limit = 10;
    const skip = req.query.skip ? Number(req.query.skip) * limit : 0;
    const min = req.query.min ? Number(req.query.min) : 0;
    const max = req.query.max ? Number(req.query.max) : 10000;

    const data = await ToyModel
      .find({
        price: { $gte: min, $lte: max }
      })
      .limit(limit)
      .skip(skip)
      .sort({ _id: 1 });

    res.json(data);
  }
  catch(err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

router.get("/single/:id", async(req,res) => {
  try{
    const id = req.params.id
    let data = await ToyModel.findOne({_id:id});
    res.json(data);
  }
  catch(err){
    console.log(err);
    res.status(502).json({err})
  }
})

router.post("/", auth, async(req,res) => {
  let validBody = validateToy(req.body);
  if(validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let  toy = new ToyModel(req.body);
   toy.user_id = req.tokenData._id;

    await toy.save();
    res.json(toy)
  }
  catch(err) {
    console.log(err);
    res.status(502).json( {err})
  }
})

router.put("/:id", auth, async(req,res) => {
  let validBody = validateToy(req.body);
  if(validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
   let id = req.params.id;
    let data = await ToyModel.updateOne(
      {_id:id, user_id:req.tokenData._id},
      req.body
    );
    res.json(data);
  }
  catch(err) {
    console.log(err);
    res.status(502).json({err})
  }
})

router.delete("/:id", auth,  async(req,res) => {
  try {
    let id = req.params.id;
    let data;
    if(req.tokenData.role == "admin") {
      data = await ToyModel.deleteOne({_id:id} );
    }
    else {
      data = await ToyModel.deleteOne({_id:id, user_id:req.tokenData._id} );
    }
    res.json(data)
  }
  catch(err) {
    console.log(err);
    res.status(502).json( {err})
  }
})

router.get("/count", async(req,res) => {
  try{
    const limit = req.query.limit || 10
    const count = await ToyModel.countDocuments({})
    res.json({count,pages:Math.ceil(count/limit)})
  }
  catch(err) {
    console.log(err);
    res.status(502).json( {err})
  }
})

module.exports = router;