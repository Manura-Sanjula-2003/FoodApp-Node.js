const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Refund must belong to a user']
    },
    Food: {
        type: mongoose.Schema.ObjectId,
        ref: 'Foods',
        required: [true, 'Refund must belong to a Food.']
    },
    price: {
        type: Number,
    },
    evidence: [String],
    feedback: {
        type: String,
        default: 'No Admin FeedBack sor far ',
    },
    quantity: {
        type: Number,
        default: 1,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    why: {
        type: String,
    },
    success: {
        type: Boolean,
        default: false
    }
});
refundSchema.index({ Food: 1 });
refundSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'Food',
        select: 'name coverImg img description'
    }).populate({
        path: 'user',
        select: 'name photo'
    });
    next();
});




const Refund = mongoose.model('refunds', refundSchema);

module.exports = Refund;
