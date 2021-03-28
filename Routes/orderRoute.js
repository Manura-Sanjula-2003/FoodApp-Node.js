const express = require('express');
const router = express.Router();
const orderController = require('../Controllers/orderController');
const authController = require('../Controllers/authController');

router.use(authController.protect);

router.route('/').
    post(authController.restrictTo('user','admin', 'chef'), orderController.checkData, orderController.createOrder)
    .get(authController.restrictTo('user','admin', 'chef'), orderController.getAllOrder);

router.route('/chekoutAll').get(authController.restrictTo('user','admin', 'chef'), orderController.checkOutAll)

router.route('/:id').
    get(authController.restrictTo('user','admin', 'chef'), orderController.getOneOrder);

router.route('/:id/getInvoice').
    get(authController.restrictTo('user','admin', 'chef'), orderController.getInvoice);


router.get('/:id/confrimRecive', authController.restrictTo('user'), orderController.confrimRecive)

module.exports = router