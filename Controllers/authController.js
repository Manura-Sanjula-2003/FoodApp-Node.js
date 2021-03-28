const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../Models/userModel');
const Email = require('./../utils/email');
const FoodModel = require('../Models/foodModel');
const errorController = require('./errorController');

exports.conEmail = async (req, res, next) => {
  let token;
  try {
    if (!req.query.user || !req.query.userId) {
      return res.status(400).json({
        status: 'fail',
        message: "User Token or  UserId  Missing"
      });
    }
    token = req.query.user

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({
        status: 'fail',
        message: 'Time Expired',
      })
    }
    const currentUser = await User.findById(decoded.id);
    if (req.query.userId !== decoded.id) {
      return res.status(401).json({
        status: 'fail',
        message: 'Wrong Token',
      })
    }
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token does no longer exist.',
      })
    }
    const user = await User.findByIdAndUpdate(decoded.id, { emailConfrim: true })
    return res.status(200).json({
      status: 'okay',
      user
    })

  } catch (error) {
    errorController(req, res, error)
    // if (error.message == 'jwt expired') {
    //   return res.status(401).json({
    //     status: "fail",
    //     message: "token expired",
    //   })
    // }
    // return res.status(500).json({
    //   status: "fail",
    //   message: error.message,
    // })
  }
}


const signToken = (id, type = '') => {
  if (type === 'email') {
    console.log(type)
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: '600s'
    });
  } else {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
  }
};


const createSendToken = async (user, statusCode, res,req) => {
  const emailToken = signToken(user._id, 'email');
  const token = signToken(user._id);
  const url = `${req.protocol}://${req.get('host')}/api/v1/user/confrimEmail?user=${emailToken}&userId=${user._id.toString()}`;
  await new Email(user, url).sendWelcome();
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  return res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.signup = async (req, res, next) => {
  try {
    if (!req.body.name || !req.body.email || !req.body.password || !req.body.passwordConfirm) {
      return res.status(400).json({
        status: 'fail',
        message: 'Fill All Fields'
      })
    }

    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      photo: req.body.photo
    });
    
    if (!newUser) {
      return res.status(500).json({
        status: 'fail',
        message: "Could not create User"
      })
    }

    createSendToken(newUser, 201, res,req);
  } catch (error) {
    // if (error.code === 11000) {
    //   return res.status(400).json({
    //     status: 'fail',
    //     message: 'User AllReady Exits given Email'
    //   })
    // }
    // return res.status(500).json({
    //   status: 'fail',
    //   message: error.message,
    // })
    errorController(req, res, error)
  }
};


exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

  
    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: 'Please provide email and password!'
      });
    }
   
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: "fail",
        message: 'Incorrect email or password'
      });
    }
    createSendToken(user, 200, res);
  } catch (err) {
    // return res.status(401).json({
    //   status: "fail",
    //   message: error.message,
    // });
    errorController(req, res, error)
  }
};

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};


exports.addLikes = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    if (!currentUser) {
      return res.status(401).json({ status: 'fail', message: 'No User Found' });
    }
    const foodId = req.query.foodId;
    const food = await FoodModel.findById(foodId);
    if (!food) {
      return res.status(400).json({ status: 'fail', message: 'No Food Found give foodId' });
    }
    if (!currentUser.Likes.includes(foodId)) {
      currentUser.Likes.push(foodId);
      currentUser.save({ validateBeforeSave: false });
      food.likes++;
      food.save({ validateBeforeSave: false });
    } else {
      currentUser.Likes.pop(foodId);
      currentUser.save({ validateBeforeSave: false });
      food.likes--;
      if (food.likes < 0) {
        food.likes = 0
      }
      food.save({ validateBeforeSave: false });
    }

    return res.status(200).json({ status: 'success' });
  } catch (error) {
    // console.log(err)
    // return res.status(500).json({ status: 'fail', message: error.message, });
    errorController(req, res, error)
  }
};

exports.protect = async (req, res, next) => {
  try {
    if (!req.query.userId) {
      return res.status(401).json({
        status: 'fail',
        message: 'No Found UserId in QueryParam',
      })
    }
  
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in! Please log in to get access.'
      })

    }

   
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    
    const currentUser = await User.findById(decoded.id);
    if (req.query.userId !== decoded.id) {
      return res.status(401).json({
        status: 'fail',
        message: 'Wrong Token',
      })
    }
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token does no longer exist.',
      })
    }

   
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        status: 'fail',
        message: 'User recently changed password! Please log in again.',
      })
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  } catch (error) {
    errorController(req, res, error)
    // return res.status(500).json({
    //   status: 'fail',
    //   message: error.message,
    // })
  }
};


exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
    
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

    
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

     
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

    
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action',
      })
    }

    next();
  };
};

exports.forgotPassword = async (req, res, next) => {
  try {
  
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'There is no user with email address.',
      })
    }

   
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

   
    try {
      const resetURL = `${req.protocol}://${req.get(
        'host'
      )}/api/v1/user/resetPassword/${resetToken}`;
      await new Email(user, resetURL).sendPasswordReset();

      res.status(200).json({
        status: 'success',
        message: 'Token sent to email!'
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({
        status: 'fail',
        message: 'There was an error sending the email. Try again later!',
      })
    }
  } catch (error) {
    errorController(req, res, error)
    // return res.status(500).json({
    //   status: 'fail',
    //   message: error.message,
    // })
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
   
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

  
    if (!user) {
      return res.status(400).json({
        status: 'fail',
        message: 'Token is invalid or has expired'
      })
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();


    createSendToken(user, 200, res);
  } catch (err) {
    errorController(req, res, error)
    // return res.status(500).json({
    //   status: 'fail',
    //   message: error.message,
    // })
  }
};


exports.registerEmail = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const token = signToken(user._id, 'email');
    const url = `${req.protocol}://${req.get('host')}/api/v1/user/confrimEmail?user=${token}&userId=${newUser._id.toString()}`;
    await new Email(newUser, url).sendWelcome();
  } catch (error) {
    errorController(req, res, error)
    // return res.status(401).json({
    //   status: 'fail',
    //   message: error.message
    // })
  }
}

exports.updatePassword = async (req, res, next) => {
  try {
   
    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Your current password is wrong.'
      })
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
  
    createSendToken(user, 200, res);
  } catch (err) {
    errorController(req, res, error)
    // return res.status(401).json({
    //   status: 'fail',
    //   message: 'Cound not find User'
    // })
  }
};