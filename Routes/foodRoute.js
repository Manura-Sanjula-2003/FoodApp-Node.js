const express = require('express')
const Router = express.Router();
const authController = require('./../Controllers/authController');
const foodControler = require('../Controllers/foodController');

Router.route('/foods').
    post(authController.protect, authController.restrictTo('admin','chef'),
        foodControler.uploadTourImages,
        foodControler.resizeTourImages,
        foodControler.insertOneFood
    )
Router.get('/foods/slug/:slugName',foodControler.getOneFoodBySlug)

Router.route('/foods/:id').
    get(foodControler.getOneFood)
    .put(authController.protect, authController.restrictTo('admin','chef'),
        foodControler.uploadTourImages,
        foodControler.resizeTourImages,
        foodControler.updateOneFood
    ).delete(authController.protect, authController.restrictTo('admin','chef'),foodControler.deleteOneFood);

Router.route('/foods').get(foodControler.getAllFoods)

module.exports = Router;