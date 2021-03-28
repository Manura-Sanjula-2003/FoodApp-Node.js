const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slugify = require('slugify');

const FoodSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    slug: String,
    img: {
        type: [String],
        default: []
    },
    description: {
        type: String,
        min: 10,
        required: true
    },
    likes: Number,
    unLikes: Number,
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
    coverImg: {
        type: String,
        default: 'coverImg.png'
    },
    nutritionPer100g: {
        Calcium: { type: Number, default: "" },
        Carbohydrate: { type: Number, default: "" },
        DietaryFibre: { type: Number, default: "" },
        Energy: { type: Number, default: "" },
        Fat: { type: Number, default: "" },
        Iron: { type: Number, default: "" },
        Magnesium: { type: Number, default: "" },
        Manganese: { type: Number, default: "" },
        MonounsaturatedFat: { type: Number, default: "" },
        Omega3FattyAcid: { type: Number, default: "" },
        Phosphorus: { type: Number, default: "" },
        PolyunsaturatedFat: { type: Number, default: "" },
        Potassium: { type: Number, default: "" },
        Protein: { type: Number, default: "" },
        SaturatedFat: { type: Number, default: "" },
        Sodium: { type: Number, default: "" },
        Starch: { type: Number, default: "" },
        Sugars: { type: Number, default: "" },
        TransFat: { type: Number, default: "" },
        VitaminA: { type: Number, default: "" },
        VitaminB1: { type: Number, default: "" },
        VitaminB2: { type: Number, default: "" },
        VitaminB3: { type: Number, default: "" },
        VitaminB5: { type: Number, default: "" },
        VitaminB6: { type: Number, default: "" },
        VitaminB9: { type: Number, default: "" },
        VitaminC: { type: Number, default: "" },
        VitaminE: { type: Number, default: "" },
        Vitamink: { type: Number, default: "" },
        Zinc: { type: Number, default: "" },

    },
    nutritionPer100ml: {
        Calcium: { type: Number, default: "" },
        Carbohydrate: { type: Number, default: "" },
        DietaryFibre: { type: Number, default: "" },
        Energy: { type: Number, default: "" },
        Fat: { type: Number, default: "" },
        MonounsaturatedFat: { type: Number, default: "" },
        PolyunsaturatedFat: { type: Number, default: "" },
        Potassium: { type: Number, default: "" },
        Protein: { type: Number, default: "" },
        SaturatedFat: { type: Number, default: "" },
        Sodium: { type: Number, default: "" },
        Sugars: { type: Number, default: "" },
        TransFat: { type: Number, default: "" },
        VitaminE: { type: Number, default: "" },
    },
    tags: [String],
    price: {
        default: 10,
        type: Number
    },
    like: Boolean,
    foodHuts: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'FoodHut'
        }
    ],
    review: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Review'
        }
    ],
    offer: {
        type: Boolean,
        default: true
    }
});

// FoodSchema.pre(/^find/, function (next) {
//     this.populate({
//         path: 'foodHuts',
//     })
//     next();
// }); 
FoodSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

FoodSchema.post(/^find/, function (docs, next) {

    next();
});

const Food = mongoose.model('Foods', FoodSchema);

module.exports = Food;