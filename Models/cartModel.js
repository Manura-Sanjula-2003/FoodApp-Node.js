const mongoose = require('mongoose');
const FoodModel = require('./foodModel');

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Cart must belong to a user']
    },
    Food: {
        type: mongoose.Schema.ObjectId,
        ref: 'Foods',
        required: [true, 'Cart must belong to a Food.']
    },
    price: {
        type: Number,
       
    },
    quantity: {
        type: Number,
        default: 1,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});
cartSchema.index({ Food: 1 }, { unique: true });

cartSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'Food',
        select: 'name coverImg img description'
    }).populate({
        path: 'user',
        select: 'name photo'
    });
    next();
}); 

cartSchema.pre('save', async function (next) {
    if (this.quantity === 1) {
        const food = await FoodModel.findById(this.Food);
        const foodprice = food.price;
        this.price = foodprice
        next();
    } else {
        const food = await FoodModel.findById(this.Food);
        const foodprice = food.price * this.quantity;
        this.price = foodprice
        next();
    }
});

cartSchema.post(/^find/, function (docs, next) {
    next();
});


const Cart = mongoose.model('carts', cartSchema);

module.exports = Cart;
