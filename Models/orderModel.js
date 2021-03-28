const mongoose = require('mongoose');
const FoodModel = require('./foodModel')
const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Order must belong to a user']
    },
    Food: {
        type: mongoose.Schema.ObjectId,
        ref: 'Foods',
        required: [true, 'Order must belong to a Food.']
    },
    price: {
        type: Number,
    },
    quantity: {
        type: Number,
        default: 1,
    },
    orderAt: {
        type: Date,
        default: Date.now
    },
    delivered: {
        type: Boolean,
        default: false
    },
    confrimRecive: {
        type: Boolean,
        default: false
    }
});


orderSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'Food',
        select: 'name description '
    }).populate({
        path: 'user',
        select: 'name photo address coverImg'
    });
    next();
});

orderSchema.pre('save', async function (next) {
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


orderSchema.post(/^find/, function (docs, next) {
  
    next();
});


const order = mongoose.model('orders', orderSchema);

module.exports = order;