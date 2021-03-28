const express = require('express');
const router = express.Router();
const cartController = require('../Controllers/cartController');
const authController = require('../Controllers/authController');

router.use(authController.protect);

router.route('/').
    post(authController.restrictTo('user','admin', 'chef'), cartController.checkData, cartController.createCart).
    get(authController.restrictTo('user','admin', 'chef'), cartController.getAllCart)
    
router.route('/:id').
    get(authController.restrictTo('user','admin', 'chef'), cartController.getOneCart)
    .delete(authController.restrictTo('user','admin', 'chef'), cartController.deleteCart);

module.exports = router