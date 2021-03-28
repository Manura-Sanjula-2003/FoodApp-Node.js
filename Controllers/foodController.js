const foodModel = require('../Models/foodModel');
const multer = require('multer');
const sharp = require('sharp');
const multerStorage = multer.memoryStorage();
const User = require('../Models/userModel');
const errorController = require('./errorController');

exports.deleteOneFood = async (req, res, next) => {
    try {
        if (!req.params.id) {
            return res.status(400).json({
                status: 'failed',
                message: 'Id not defined'
            })
        }
        const newData = await foodModel.findById(req.params.id);
        newData.offer = false;
        newData.save();
        return res.status(400).json({
            status: 'success',
            data: newData
        })
    } catch (err) {
        // return res.status(500).json({
        //     status: 'failed',
        //     message: err.message
        // })
        errorController(req, res, err)
    }
}

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

exports.uploadTourImages = upload.fields([
    { name: 'coverImg', maxCount: 1 },
    { name: 'img', maxCount: 3 }
]);

exports.resizeTourImages = async (req, res, next) => {
    try {

        if (req.files) {
            if (req.files.coverImg) {
                req.body.coverImg = `food-${Math.floor(Date.now() + Date.now() + Math.random() * 8892829229)}-${Date.now()}-cover.jpeg`;
                await sharp(req.files.coverImg[0].buffer)
                    .resize(2000, 1333)
                    .toFormat('jpeg')
                    .jpeg({ quality: 90 })
                    .toFile(`public/img/foods/${req.body.coverImg}`);
            }
            if (req.files.img) {
                req.body.img = [];
                await Promise.all(
                    req.files.img.map(async (file, i) => {
                        const filename = `food-${Math.floor(Date.now() + Date.now() + Math.random() * 8892829229)}-${Date.now()}-${i + 1}.jpeg`;

                        await sharp(file.buffer)
                            .resize(2000, 1333)
                            .toFormat('jpeg')
                            .jpeg({ quality: 90 })
                            .toFile(`public/img/foods/${filename}`);

                        req.body.img.push(filename);
                    })
                );
            }
        }
        next();
    } catch (err) {
        return res.status(500).json({
            status: 'failed',
            message: err.message
        })
    }
};

exports.insertOneFood = async (req, res, next) => {
    try {
        const newData = await foodModel.create(req.body);
        return res.status(201).json({
            status: 'success',
            data: newData,
        })
    } catch (err) {
        // return res.status(500).json({
        //     status: 'failed',
        //     message: err.message
        // })
        errorController(req, res, err)
    }
}

exports.updateOneFood = async (req, res, next) => {

    try {
        const updateFood = await foodModel.findByIdAndUpdate(req.params.id, req.body);
        return res.status(200).json({
            status: 'success',
            data: updateFood,
        })
    } catch (err) {
        errorController(req, res, err)
    }
}

const select = (req, data) => {

    if (req.tags) {
        data = data.filter(val => {
            const tags = [...val.tags];
            let boolen = false;
            tags.forEach((val, i) => {
                (val)
                if (val === req.tags === true) {
                    boolen = true;
                }
            })
            return boolen;
        })
    }

    // REQ RATING
    if (req.rating) {
        if (req.rating.gt) {
            data = data.filter(val => {
                return val.ratingsAverage > req.rating.gt;
            })
        }
        if (req.rating.lt) {
            data = data.filter(val => {
                return req.rating.lt > val.ratingsAverage
            })
        }
    }

    // REQ LIKES
    if (req.likes) {
        if (req.likes.gt) {
            data = data.filter(val => {
                return val.likes > req.likes.gt;
            })
        }
        if (req.likes.lt) {
            data = data.filter(val => {
                return req.likes.lt > val.likes;
            })
        }
    }

    if (req.nutritionPer100g) {
        const ob = req.nutritionPer100g;
        const arry = Object.keys(ob).toString();

        const protien = arry.split('-')[0];
        const lgthan = arry.split('-')[1];

        if (lgthan === 'gt') {
            const value = ob[arry];
            data = data.filter(val => {
                
                return val.nutritionPer100g[protien] > value;
            })
        } else {
            const value = ob[arry];
            data = data.filter(val => {
                
                return val.nutritionPer100g[protien] < value;
            })
        }
    }

    if (req.nutritionPer100ml) {
        const ob = req.nutritionPer100ml;
        const arry = Object.keys(ob).toString();

        const protien = arry.split('-')[0];
        const lgthan = arry.split('-')[1];

        if (lgthan === 'gt') {
            const value = ob[arry];
            data = data.filter(val => {
                //ionPer100ml[protien], value)
                return val.nutritionPer100ml[protien] > value;
            })
        } else {
            const value = ob[arry];
            data = data.filter(val => {
                (val.nutritionPer100ml[protien], value)
                return val.nutritionPer100ml[protien] < value;
            })
        }
    }


    return data;
}

exports.getAllFoods = async (req, res, next) => {
    try {

        const newData = await foodModel.find()
        const result = select(req.query, newData);

        if (req.query.userId) {
            const user = await User.findById(req.query.userId);
            result.forEach((food, i) => {
                user.Likes.forEach((item, i) => {
                    if (food._id.toString() === item) {
                        food.like = true;
                    } else {
                        food.like = false;
                    }
                })
                console.log(food.like)
            })
        }
        return res.status(200).json({
            size: result.length,
            status: 'success',
            data: result,
        })
    } catch (err) {
        errorController(req, res, err)
    }
}

exports.getOneFood = async (req, res, next) => {
    try {
        if (!req.params.id) {
            return res.status(400).json({
                status: 'failed',
                message: 'Id not defined'
            })
        }
        const newData = await foodModel.findById(req.params.id).populate({ path: 'foodHuts' }).populate({ path: 'review' })
        if (req.query.userId) {
            const user = await User.findById(req.query.userId);
            user.Likes.forEach((item, i) => {
                if (newData._id.toString() === item) {
                    newData.like = true;
                } else {
                    newData.like = false;
                }
            })
        }
        return res.status(200).json({
            size: newData.length,
            status: 'success',
            data: newData,
        })
    } catch (err) {
        errorController(req, res, err)
    }
}


exports.getOneFoodBySlug = async (req, res, next) => {
    try {
        if (!req.params.id) {
            return res.status(400).json({
                status: 'failed',
                message: 'Id not defined'
            })
        }
        const newData = await foodModel.findOne({ slug: req.params.slugName }).populate({ path: 'foodHuts' }).populate({ path: 'review' })
        if (req.query.userId) {
            const user = await User.findById(req.query.userId);
            user.Likes.forEach((item, i) => {
                if (newData._id.toString() === item) {
                    newData.like = true;
                } else {
                    newData.like = false;
                }
            })
        }
        return res.status(200).json({
            size: newData.length,
            status: 'success',
            data: newData,
        })
    } catch (err) {
        errorController(req, res, err)
    }
}