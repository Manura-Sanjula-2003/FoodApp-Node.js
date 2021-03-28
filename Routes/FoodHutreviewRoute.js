const express = require('express');
const FoodHutreview = require('./../Controllers/FoodHutReviewController');
const authController = require('./../Controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .post('/',
    authController.restrictTo('user','admin','chef'),
    FoodHutreview.setTourUserIds,
    FoodHutreview.createReview
  );

router
  .route('/:id')
  .get(FoodHutreview.getReview)
  .patch(
    authController.restrictTo('user', 'admin','chef'),
    FoodHutreview.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin','chef'),
    FoodHutreview.deleteReview
  );

module.exports = router;
