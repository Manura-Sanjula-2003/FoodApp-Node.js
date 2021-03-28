const multer = require('multer');
const sharp = require('sharp');
const User = require('./../Models/userModel');
const RefundModel = require('./../Models/refundModle');
const factory = require('./handlerFactory');
const Email = require('./../utils/email');
const Food = require('../Models/foodModel');
const errorController = require('./errorController');

exports.refunds = async (req, res, next) => {
  try {
    const user = await User.findOne(req.user);
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'No User Found'
      });
    }
    req.body.user = user._id;

    const refund = await RefundModel.findOne({ user: user._id });
    return res.status(200).json({
      status: 'success',
      data: refund
    });
  } catch (err) {
    errorController(req, res, err)
  }
}

exports.requestRefunds = async (req, res, next) => {
  try {
    const user = await User.findOne(req.user);
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'No User Found'
      });
    }
    req.body.user = user._id;
    const food = await Food.findById(req.body.Food);
    req.body.price = Number(food.price);
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/user/refunds`;

    const refund = await RefundModel.create(req.body);
    await new Email(user, resetURL).refund();
    return res.status(201).json({
      status: 'success',
      data: refund
    });
  } catch (err) {
    errorController(req, res, err)
  }
}

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadImages = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'evidence', maxCount: 3 }
]);

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

exports.resizePhoto = async (req, res, next) => {
  if (req.files) {
    if (req.files.photo) {
      req.body.photo = `user-${getRandomInt(1999191919191)}-${Date.now()}-cover.jpeg`;
      await sharp(req.files.photo[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.body.photo}`);
    }

    if (req.files.evidence) {
      req.body.evidence = [];
      await Promise.all(
        req.files.evidence.map(async (file, i) => {
          const filename = `evidence-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

          await sharp(file.buffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/img/evidence/${file}`);

          req.body.evidence.push(filename);
        })
      );
    }
  }




  next();
}

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = async (req, res, next) => {
  try {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
      return res.status(400).json({
        status: 'fail',
        message: 'This route is not for password updates. Please use /updateMyPassword.',
      })
    }

    // 2) Filtered out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email');
    if (req.file) filteredBody.photo = req.file.filename;

    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true
    });

    return res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  } catch (err) {
    errorController(req, res, err)
  }
};

exports.deleteMe = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    return res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    errorController(req, res, err)
  }
};

exports.createUser = (req, res) => {
  return res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead'
  });
};

exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);

// Do NOT update passwords with this!
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
