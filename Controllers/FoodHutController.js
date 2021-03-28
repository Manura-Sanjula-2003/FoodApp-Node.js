const multer = require('multer');
const sharp = require('sharp');
const FoodHutModel = require('./../Models/FoodHutModel');
const multerStorage = multer.memoryStorage();
const User = require('../Models/userModel');
const errorController = require('./errorController');

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

exports.uploadFoodHutImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);

exports.resizeTourImages = async (req, res, next) => {

  const id = req.params.id || req.user._id
  if (req.files) {
    // 1) Cover image
    if (req.files.imageCover) {
      req.body.imageCover = `foodHut-${id}-${Date.now()}-cover.jpeg`;
      await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/foodHut/${req.body.imageCover}`);

    }
    // 2) Images
    if (req.files.images) {
      req.body.images = [];
      await Promise.all(
        req.files.images.map(async (file, i) => {
          const id = req.params.id || req.user._id
          const filename = `foodHut-${id}-${Date.now()}-${i + 1}.jpeg`;

          await sharp(file.buffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/img/foodHut/${filename}`);

          req.body.images.push(filename);
        })
      );
    }
  }
  next();
}

exports.addOneFoodHut = async (req, res, next) => {
  try {
    if (!req.body.name || !req.body.summary || !req.body.openAt ||
      !req.body.description || !req.body.imageCover) {
      return res.status(400).json({
        status: 'failed',
        message: 'major fields are missing Ex - name , imageCover , description, summary  '
      })
    }
    const arry = [...req.body.chefs];
    let isChef = true
    for (let item = 0; item < arry.length; item++) {
      const user = await User.findById(arry[item]);
      if(!user){
        return res.status(400).json({
          status: 'fail',
          message: 'No UserFound given ID'
        })       }
      if (user.role !== 'chef') {
        isChef = false;
        break;
      }
    }
    if (isChef === false) {
      return res.status(400).json({
        status: 'fail',
        message: 'Make Sure Only Chef IDS'
      })
    }
    const foodHut = await FoodHutModel.create(req.body);
    return res.status(201).json({
      status: 'success',
      data: foodHut,
    })
  } catch (err) {
    errorController(req, res, err)

  }
}

exports.updateOneFoodHut = async (req, res, next) => {
  try {
   
    const foodHut = await FoodHutModel.findByIdAndUpdate(req.params.id, req.body);
    return res.status(200).json({
      status: 'success',
      data: foodHut,
    })
  } catch (err) {
    errorController(req, res, err)

  }
}

exports.getOneFoodHut = async (req, res, next) => {
  try {
    const foodHut =
      await FoodHutModel.findById(req.params.id).populate({ path: 'foods' }).populate({ path: 'reviews' }).populate({ path: 'chefs' })
    return res.status(200).json({
      status: 'success',
      data: foodHut,
    })
  } catch (err) {
    errorController(req, res, err)

  }
}

exports.getAllFoodHuts = async (req, res, next) => {
  try {
    const foodHuts = await FoodHutModel.find();
    return res.status(200).json({
      status: 'success',
      data: foodHuts,
      size: foodHuts.length
    })
  } catch (err) {
    errorController(req, res, err)

  }
}

exports.getMonthlyPlan = async (req, res, next) => {
  const year = req.params.year * 1; // 2021

  const plan = await FoodHutModel.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        foodHut: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { numTourStarts: -1 }
    },
    {
      $limit: 12
    }
  ]);

  return res.status(200).json({
    status: 'success',
    data: {
      plan
    }
  });
}

exports.disable = async (req, res, nex) => {
  try {
    const foodHut = await FoodHutModel.findById(req.params.id);
    foodHut.isOffer = false;
    foodHut.save();
    return res.status(200).json({
      status: 'done',
      data: foodHut
    })
  } catch (err) {
    errorController(req, res, err)

  }
}


exports.getFoodHutWithin = async (req, res, next) => {
  try {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lng) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide latitutr and longitude in the format lat,lng.',
      })
    }

    const foodHut = await FoodHutModel.find({
      startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    });

    return res.status(200).json({
      status: 'success',
      results: foodHut.length,
      data: foodHut

    });
  } catch (err) {
    errorController(req, res, err)

  }
}

exports.getDistances = async (req, res, next) => {
  try {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if (!lat || !lng) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide latitute and longitude in the format lat,lng.',
      })
    }

    const distances = await FoodHutModel.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng * 1, lat * 1]
          },
          distanceField: 'distance',
          distanceMultiplier: multiplier
        }
      },
      {
        $project: {
          distance: 1,
          name: 1
        }
      }
    ]);

    return res.status(200).json({
      status: 'success',
      data: {
        data: distances
      }
    });
  } catch (err) {
    errorController(req, res, err)

  }
}
