const mongoose = require('mongoose');
const Food = require('./foodModel');
const User = require('./userModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!'],
      unique: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    Food: {
      type: mongoose.Schema.ObjectId,
      ref: 'Foods',
      required: [true, 'Review must belong to a Food.']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

reviewSchema.index({ Food: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'Food',
  //   select: 'name'
  // }).populate({
  //   path: 'user',
  //   select: 'name photo'
  // });

  this.populate({
    path: 'user',
    select: 'name photo'
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (FoodId) {
  const stats = await this.aggregate([
    {
      $match: { Food: FoodId }
    },
    {
      $group: {
        _id: '$Food',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  // (stats);

  if (stats.length > 0) {
    await Food.findByIdAndUpdate(FoodId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Food.findByIdAndUpdate(FoodId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

reviewSchema.post('save',async function () {
  // this points to current review
  const food = await Food.findById(this.Food);
  const arry = food['review'];
  arry.push(this._id);
  food['review'] = arry
  food.save()
  this.constructor.calcAverageRatings(this.Food);
});

reviewSchema.post('save',async function () {
  // this points to current review
  const user = await User.findById(this.user);
  const arry = user['review'];
  arry.push(this._id);
  user['review'] = arry
  user.save({ validateBeforeSave: false })
});


reviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne(); does NOT work here, query has already executed
  await this.r.constructor.calcAverageRatings(this.r.Food);
});

reviewSchema.post(/^find/, function (docs, next) {
  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
