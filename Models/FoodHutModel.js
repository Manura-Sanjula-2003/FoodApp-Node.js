const mongoose = require('mongoose');
const slugify = require('slugify');
const Food = require('../Models/foodModel');

const FoodHutModel = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A FoodHut must have a name'],
            unique: true,
            trim: true,
            maxlength: [40, 'A FoodHut name must have less or equal then 40 characters'],
            minlength: [10, 'A FoodHut name must have more or equal then 10 characters']
            // validate: [validator.isAlpha, 'FoodHut name must only contain characters']
        },
        slug: String,
        GroupSizePerTable: {
            type: Number,
            default: 4
        },
        ratingsAverage: {
            type: Number,
            default: 3.5,
            min: [1, 'Rating must be above 1.0'],
            max: [5, 'Rating must be below 5.0'],
            set: val => Math.round(val * 10) / 10 // 4.666666, 46.6666, 47, 4.7
        },
        ratingsQuantity: {
            type: Number,
            default: 0
        },
        summary: {
            type: String,
            trim: true,
            required: [true, 'A FoodHut must have a summary']
        },
        description: {
            type: String,
            trim: [true, 'A FoodHut must have a description']
        },
        imageCover: {
            type: String,
            required: [true, 'A FoodHut must have a cover image']
        },
        images: [String],
        openAt: {
            type: String,
            required: true
        },
        Location: {
            // GeoJSON
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String
        },
        reviews: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'FoodHutReview'
            }
        ],
        foods: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'Foods'
            }
        ],
        chefs: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'User'
            }
        ],
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);




// FoodHutModel.index({ price: 1 });
FoodHutModel.index({ price: 1, ratingsAverage: -1 });
FoodHutModel.index({ slug: 1 });
FoodHutModel.index({ startLocation: '2dsphere' });


FoodHutModel.post('save', async function () {
    const array = [...this.foods];
    for (let i = 0; i < array.length; i++) {
        const element = array[i];
        const food = await Food.findById(element);
        const foodHutSet = new Set(food.foodHuts);
        foodHutSet.add(this._id);
        food.foodHuts = Array.from(foodHutSet);
        food.save();
    }

});
// DOCUMENT MIDDLEWARE: runs before .save() and .create()
FoodHutModel.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});


FoodHutModel.post(/^find/, function (docs, next) {
    next();
});


const FoodHut = mongoose.model('FoodHut', FoodHutModel);

module.exports = FoodHut;
