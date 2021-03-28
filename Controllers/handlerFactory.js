const errorController = require('./errorController');

exports.deleteOne = Model =>
  async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  }

exports.updateOne = Model =>
  async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  };

exports.createOne = Model =>
  async (req, res, next) => {
    try {
      const doc = await Model.create(req.body);

      return res.status(201).json({
        status: 'success',
        data: doc

      });
    } catch (err) {
      return res.status(500).json({
        status: 'fail',
        err
      });
    }
  };

exports.getOne = (Model, popOptions) =>
  async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  }

exports.getAll = Model =>
  async (req, res, next) => {

    const data = await Model.find();
    return res.status(200).json({
      size: data.length,
      status: 'success',
      data: data,
    })

  }
