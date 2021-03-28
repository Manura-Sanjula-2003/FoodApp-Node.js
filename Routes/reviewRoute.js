const express = require('express');
const reviewController = require('./../Controllers/reviewController');
const authController = require('./../Controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user','admin','chef'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .delete(
    authController.restrictTo('user', 'admin','chef'),
    reviewController.deleteReview
  );

module.exports = router;
