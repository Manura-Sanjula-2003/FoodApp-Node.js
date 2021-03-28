const Review = require('./../Models/review');
const errorController = require('./errorController');
const UserModel = require('../Models/userModel');
const FoodModel = require('../Models/foodModel')

exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllReviews = async (req, res, next) => {
  try {
    const review = await Review.find();
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
    const review = await Review.findById(req.params.id);
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
    if (!req.body.review || !req.body.rating || !req.body.Food) {
      return res.status(400).json({
        status: 'fail',
        message: 'Major Fileds Review , Rating , Food Missing.',
      })
    }
    req.body.user = req.user._id;
    
    const user = await UserModel.findById(req.body.user._id);
    const food =  await FoodModel.findById(req.body.Food);
  
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message:'Not Authenthicate'
      })
    }

    if (!food) {
      return res.status(400).json({
        status: 'fail',
        message:'No Food Found Given Id'
      })
    }

    const review = await Review.create(req.body);
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
    if (!req.body.review || !req.body.rating || !req.body.Food) {
      return res.status(400).json({
        status: 'fail',
        message: 'Major Fileds Review , Rating , Food Missing.',
      })
    }
    const review = await Review.findOneAndUpdate(req.params.id, req.body);
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
    const review = await Review.findByIdAndDelete(req.params.id);
    return res.status(200).json({
      status: 'success',
    })
  } catch (err) {
    errorController(req, res, err)
  }
}
