const orderModel = require('../Models/orderModel');
const PDFDocument = require('pdfkit');
const Email = require('../utils/email');
const errorController = require('./errorController');

exports.getInvoice = async (req, res, next) => {
    try {
        const orderItem = await orderModel.findOne({ user: req.user, _id: req.params.id });
        if (!orderItem) {
            return res.status(400).json({
                status: 'fail',
                message: 'No found Order'
            })
        }
        const invoiceName = 'invoice-' + req.params.id + '.pdf';
        const pdfDoc = new PDFDocument();
        console.log(orderItem.quantity)
        console.log(orderItem.price)
        console.log(orderItem.orderAt)
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            'inline; filename="' + invoiceName + '"'
        );
        pdfDoc.pipe(res);

        pdfDoc.fontSize(26).text('Invoice', {
            underline: true
        });
        pdfDoc.text('-----------------------');
        pdfDoc.fontSize(20).text('Total Price: $' + orderItem.price);
        pdfDoc.text('-------------------------');
        pdfDoc.text('-------------------------');
        pdfDoc.fontSize(20).text('Total quantity: $' + orderItem.quantity);
        pdfDoc.fontSize(20).text('orderAt: $' + orderItem.orderAt);

        pdfDoc.end();
    } catch (error) {
        return res.status(400).json({
            status: 'fail',
            message:err.message
        })
    }

};

exports.confrimRecive = async (req, res, next) => {
    try {
        if (!req.user._id || !req.params.id) {
            return res.status(400).json({
                status: 'fail',
                data: null,
                message: 'UserID and orderId Missing  '
            })
        }
        const orderItem = await orderModel.findOne({ user: req.user, _id: req.params.id });

        if (!orderItem) {
            return res.status(400).json({
                status: 'fail',
                data: null,
                message: 'No found orderItem please give correct id  '
            })
        }

        orderItem.confrimRecive = true;
        orderItem.save();
        const resetURL = `${req.protocol}://${req.get(
            'host'
        )}/api/v1/user/order/${orderItem._id}/getInvoice?userId=${req.user._id}`;
        await new Email(req.user, resetURL).confrimOrder();
        return res.status(201).json({
            status: 'success',
            data: orderItem,
        })
    } catch (error) {
        errorController(req, res, err)
    }
}

exports.checkData = (req, res, next) => {
    if (!req.body.hasOwnProperty('user') || !req.body.hasOwnProperty('Food')) {
        return res.status(400).json({
            status: 'failed',
            message: 'major fields are missing Ex - Food , User '
        })
    }
    return next();
}

exports.checkOutAll = async (req, res, next) => {
    try {
        if (!req.user._id) {
            return res.status(400).json({
                status: 'fail',
                data: null,
                message: 'UserID Missing  '
            })
        }
        const allCart = await CartModel.find({ user: req.user })
        const allOrder = [];

        let price = 0;

        allCart.forEach(async cart => {
            const currentCart = { ...cart._doc };
            delete currentCart._id
            delete currentCart.createdAt;
            price += currentCart.price
            const newOrder = await (await orderModel.create(currentCart)).toJSON();
            allOrder.push(newOrder)
        })
        return res.status(200).json({
            status: 'success',
            price: price,
        })
    } catch (err) {
        errorController(req, res, err)
    }
}

exports.createOrder = async (req, res, next) => {
    try {
        const newOrder = await orderModel.create(req.body)
        return res.status(201).json({
            size: newOrder.length,
            status: 'success',
            data: newOrder,
        })
    } catch (error) {
        errorController(req, res, err)
    }
}


exports.getAllOrder = async (req, res, next) => {
    try {
        if (!req.user._id) {
            return res.status(400).json({
                status: 'fail',
                data: null,
                message: 'UserID Missing  '
            })
        }
        const orderItem = await orderModel.find({ user: req.user._id });
        return res.status(200).json({
            size: orderItem.length,
            status: 'success',
            data: orderItem,
        })
    } catch (error) {
        errorController(req, res, err)
    }
}

exports.getOneOrder = async (req, res, next) => {
    try {
        if (!req.user._id || !req.params.id) {
            return res.status(400).json({
                status: 'fail',
                data: null,
                message: 'UserID and orderId Missing  '
            })
        }
        const orderItem = await orderModel.findOne({ user: req.user, _id: req.params.id });
        return res.status(200).json({
            status: 'success',
            data: orderItem,
        })
    } catch (error) {
        errorController(req, res, err)
    }
}
