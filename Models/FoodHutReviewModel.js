const mongoose = require('mongoose');
const FoodHut = require('./FoodHutModel');

const FoodHutReviewSchema = new mongoose.Schema(
  {
    FoodHutReview: {
      type: String,
      unique: true,
      required: [true, 'Review can not be empty!']
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
    FoodHut: {
      type: mongoose.Schema.ObjectId,
      ref: 'FoodHut',
      required: [true, 'Review must have FoodHut']
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



FoodHutReviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo'
  });
  next();
});

FoodHutReviewSchema.statics.calcAverageRatings = async function (FoodHutId) {
  const stats = await this.aggregate([
    {
      $match: { FoodHut: FoodHutId }
    },
    {
      $group: {
        _id: '$FoodHut',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  // (stats);

  if (stats.length > 0) {
    await FoodHut.findByIdAndUpdate(FoodHutId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await FoodHut.findByIdAndUpdate(FoodHutId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

FoodHutReviewSchema.post('save', function () {
  // this points to current FoodHutReview
  this.constructor.calcAverageRatings(this.FoodHut);
});

FoodHutReviewSchema.post('save',async function () {
  // this points to current review
  const foodHut = await FoodHut.findById(this.FoodHut);
  const arry = foodHut['reviews'];
  arry.push(this._id);
  foodHut['reviews'] = arry
  foodHut.save()
  this.constructor.calcAverageRatings(this.Food);
});
// findByIdAndUpdate
// findByIdAndDelete
FoodHutReviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  // (this.r);
  next();
});

FoodHutReviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne(); does NOT work here, query has already executed
  await this.r.constructor.calcAverageRatings(this.r.FoodHut);
});

FoodHutReviewSchema.post(/^find/, function (docs, next) {

  next();
});

const Review = mongoose.model('FoodHutReview', FoodHutReviewSchema);

module.exports = Review;
