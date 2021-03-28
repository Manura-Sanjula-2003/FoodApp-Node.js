const FoodHutReview = require('./../Models/FoodHutReviewModel');
const errorController = require('./errorController');
const UserModel = require('../Models/userModel');
const FoodHutModel = require('../Models/FoodHutModel')

exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllReviews = async (req, res, next) => {
  try {
    const review = await FoodHutReview.find();
    return res.status(200).json({
      status: 'success',
      data: review
    })
  } catch (err) {
    errorController(req, res, err)

  }
}
exports.getReview = async (req, res, next) => {
  try {
    const review = await FoodHutReview.findById(req.params.id);
    return res.status(200).json({
      status: 'success',
      data: review
    })
  } catch (err) {
    errorController(req, res, err)
  }
}
exports.createReview = async (req, res, next) => {
  try {
    if (!req.body.FoodHutReview || !req.body.rating || !req.body.FoodHut) {
      return res.status(400).json({
        status: 'fail',
        message: 'Major Fileds FoodHutReview , Rating , FoodHut Missing.',
      })
    }
    req.body.user = req.user._id;
    const user = await UserModel.findById(req.body.user._id);
    console.log(req.body.FoodHut)
    const foodHut =  await FoodHutModel.findById(req.body.FoodHut);
  
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message:'Not Authenthicate'
      })
    }

    if (!foodHut) {
      return res.status(400).json({
        status: 'fail',
        message:'No Food Found Given Id'
      })
    }
    const review = await FoodHutReview.create(req.body);
    return res.status(201).json({
      status: 'success',
      data: review
    })
  } catch (err) {
    errorController(req, res, err)
  }
}
exports.updateReview = async (req, res, next) => {
  try {
    if (req.body.FoodHutReview || req.body.rating || !req.body.FoodHut) {
      return res.status(400).json({
        status: 'fail',
        message: 'Major Fileds FoodHutReview , Rating , FoodHut Missing.',
      })
    }
    const review = await FoodHutReview.findOneAndUpdate(req.params.id, req.body);
    return res.status(200).json({
      status: 'success',
      data: review
    })
  } catch (err) {
    errorController(req, res, err)
  }
}
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await FoodHutReview.findByIdAndDelete(req.params.id);
    return res.status(200).json({
      status: 'success',
    })
  } catch (err) {
    errorController(req, res, err)
  }
}
