const express = require('express')
const app = express()
const port = 4000
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './.config.env' });
const DB = process.env.DATABASE;
process.env.UV_THREADPOOL_SIZE = 25;
const cookieParser = require('cookie-parser');
const path = require('path');
const cluster = require('cluster');
const os = require('os');

const graphqlHttp = require('express-graphql');
const graphqlSchema = require('./GraphQl/schema');
const graphqlResolver = require('./GraphQl/resolvers');

const foodRoute = require('./Routes/foodRoute');
const userRouter = require('./Routes/userRoute');
const reviewRouter = require('./Routes/reviewRoute');
const cartRouter = require('./Routes/cartRoute');
const orderRouter = require('./Routes/orderRoute');
const foodHutRouter = require('./Routes/FoodHutRoute');
const foodHutReviewRouter = require('./Routes/FoodHutreviewRoute');

const init = () => {
    app.use(
        '/api/v2',
        graphqlHttp({
            schema: graphqlSchema,
            rootValue: graphqlResolver,
            graphiql: true,
            formatError(err) {
                if (!err.originalError) {
                    return err;
                }
                const data = err.originalError.data;
                const message = err.message || 'An error occurred.';
                const code = err.originalError.code || 500;
                return { message: message, status: code, data: data };
            }
        })
    );

    app.set('view engine', 'pug');
    app.set('views', path.join(__dirname, 'views'));
    app.use(cookieParser());

    app.use(express.json({ limit: '4000kb' }));


    app.use(function (error, req, res, next) {
        if (error.message === "invalid json") {
            return res.status(404).json({
                status: 'failed',
                message: 'Json'
            })
        } else {
            next();
        }
    });
    app.use(express.urlencoded({ extended: true }));
    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader(
            'Access-Control-Allow-Methods',
            'OPTIONS, GET, POST, PUT, PATCH, DELETE'
        );
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        next();
    });
    app.use('/api/v1/shop', foodRoute);
    app.use('/api/v1/foodHut', foodHutRouter);
    app.use('/api/v1/foodHut/review', foodHutReviewRouter);
    app.use('/api/v1/user', userRouter);
    app.use('/api/v1/shop/food/review', reviewRouter);
    app.use('/api/v1/user/cart', cartRouter);
    app.use('/api/v1/user/order', orderRouter);

    app.use((req, res, next) => {
        return res.status(404).json({
            status: 'failed',
            message: 'not Found'
        })
    })

    mongoose
        .connect(DB, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        })
        .then(() => {
            console.log('\x1b[36m%s\x1b[0m', 'Mongo DB Live')
        });



    const server = app.listen(port, () => console.log('\x1b[35m%s\x1b[0m', `app listening on ${port} port!`))


    process.on('uncaughtException', err => {
        console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
        console.log(err.name, err.message);
        process.exit(1);
    });

    process.on('unhandledRejection', err => {
        console.log('UNHANDLED REJECTION! 💥 Shutting down...');
        console.log(err.name, err.message);
        server.close(() => {
            process.exit(1);
        });
    });


}

if (cluster.isMaster) {
    for (let i = 0; i < os.cpus().length; i++) {
        cluster.fork();
    }
} else {
    init();
}


