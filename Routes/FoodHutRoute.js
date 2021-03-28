const express = require('express');
const FoodHutController = require('./../Controllers/FoodHutController');
const authController = require('./../Controllers/authController');
//const reviewRouter = require('./../routes/reviewRoutes');

const router = express.Router();

//router.use('/:tourId/reviews', reviewRouter);

router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'chef'),
    FoodHutController.getMonthlyPlan
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(FoodHutController.getFoodHutWithin);
// /tours-within?distance=233&center=-40,45&unit=mi
// /tours-within/233/center/-40,45/unit/mi

router.route('/distances/:latlng/unit/:unit').get(FoodHutController.getDistances);

router
  .route('/')
  .get(FoodHutController.getAllFoodHuts)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'chef'),
    FoodHutController.uploadFoodHutImages,
    FoodHutController.resizeTourImages,
    FoodHutController.addOneFoodHut
  );

router
  .route('/:id')
  .get(FoodHutController.getOneFoodHut)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'chef'),
    FoodHutController.uploadFoodHutImages,
    FoodHutController.resizeTourImages,
    FoodHutController.updateOneFoodHut
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'chef'),
    FoodHutController.disable
  );

module.exports = router;
