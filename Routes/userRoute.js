const express = require('express');
const userController = require('./../Controllers/userController');
const authController = require('./../Controllers/authController');

const router = express.Router();

router.get('/confrimEmail', authController.conEmail);
router.get('/registerEmail', authController.registerEmail);

router.post('/signup', userController.uploadImages,
    userController.resizePhoto, authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.get('/likes', authController.protect, authController.addLikes);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Protect all routes after this middleware
router.use(authController.protect);
router.post('/request-refunds', userController.uploadImages, userController.resizePhoto, userController.requestRefunds)
router.get('/refunds', userController.refunds);

router.patch('/updateMyPassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.patch(
    '/updateMe',
    userController.uploadImages,
    userController.resizePhoto,
    userController.updateMe
);
router.delete('/deleteMe', userController.deleteMe);

module.exports = router;