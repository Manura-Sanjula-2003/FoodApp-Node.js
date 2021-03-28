const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../Models/userModel');
const Email = require('./../utils/email');
const FoodModel = require('../Models/foodModel')
const bcrypt = require('bcryptjs');
const CartModel = require('../Models/cartModel');
const FoodHutModel = require('../Models/FoodHutModel')
const Review = require('./../Models/review');
const FoodHutReview = require('./../Models/FoodHutReviewModel');
/*
        foods:[Food!]!
        food(id:ID):Food!
        user(token:String!, Userid:ID!): User!
        orders(token:String!, Userid:ID!):[Order!]!
        order(token:String!, Userid:ID!, id:ID!):Order!
        carts(token:String!, Userid:ID!):[Cart!]!
        cart(token:String!, Userid:ID!, id:ID!):Cart!
        foodHuts():[FoodHut!]!
        foodHut(id:ID!):FoodHut!


{
  "data": {
    "createUser": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwNTVkMGVmZTFmODM3N2YzN2U0ZmQxMiIsImlhdCI6MTYxNjIzNjc4NCwiZXhwIjoxNjI0MDEyNzg0fQ.9eaSmt7u3Qd8g96QDDFLnHhgFdM_2NApZ8hvSzhZiIc",
      "user": {
        "_id": "6055d0efe1f8377f37e4fd12",
        "name": "ManuraSanjula"
      }
    }
  }
}
*/

const select = (req, data) => {


    if (req.tags) {
        data = data.filter(val => {
            const tags = [...val.tags];
            let boolen = false;
            tags.forEach((val, i) => {
                (val)
                if (val === req.tags === true) {
                    boolen = true;
                }
            })
            return boolen;
        })
    }

    if (req.rating) {

        const type = req.rating.type;
        const rating = req.rating.rate
        if (type === 'gt') {
            data = data.filter(val => {
                return val.ratingsAverage
                    > rating;
            })
        }
        if (type === 'lt') {
            data = data.filter(val => {
                return rating > val.ratingsAverage
                    ;
            })
        }
      

    }
    
    if (req.likes) {
        const type = req.likes.type;
        const rating = req.likes.rate
        console.log(type,rating)
        if (type === 'gt') {
            data = data.filter(val => {
                return val.likes
                    > rating;
            })
        }
        if (type === 'lt') {
            data = data.filter(val => {
                return rating > val.likes
                    ;
            })
        }
    }

    if (req.nutritionPer100g) {
        
        const protien = req.nutritionPer100g.field
        const type = req.nutritionPer100g.type;

        if (type === 'gt') {
            const value = req.nutritionPer100g.rate;
            data = data.filter(val => {
               
                return val.nutritionPer100g[protien] > value;
            })
        } else if (type === 'lt') {
            const value = req.nutritionPer100g.rate;
            data = data.filter(val => {
               
                return val.nutritionPer100g[protien] < value;
            })
        }
       
    }

    if (req.nutritionPer100ml) {
        const protien = req.nutritionPer100ml.field
        const type = req.nutritionPer100ml.type;

        if (type === 'gt') {
            const value = req.nutritionPer100ml.rate;
            data = data.filter(val => {
               
                return val.nutritionPer100ml[protien] > value;
            })
        } else if (type === 'lt') {
            const value = req.nutritionPer100ml.rate;
            data = data.filter(val => {
               
                return val.nutritionPer100ml[protien] < value;
            })
        }
    }


    return data;
}

const protect = async (userToken, userId) => {
    try {
        if (!userId) {
            const err = new Error('No Found UserId ');
            err.status = 401;
            throw err
        }
        if (!userToken) {
            const err = new Error('No Found Token ');
            err.status = 401;
            throw err
        }
        let token = userToken;
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
        const currentUser = await User.findById(decoded.id);

        if (userId !== decoded.id) {
            const err = new Error('Invalid Token ');
            err.status = 401;
            throw err
        }
        if (!currentUser) {
            const err = new Error('The user belonging to this token does no longer exist.');
            err.status = 401;
            throw err
        }
        if (currentUser.changedPasswordAfter(decoded.iat)) {
            const err = new Error('User recently changed password! Please log in again.');
            err.status = 401;
            throw err
        }
        return currentUser;

    } catch (error) {
        if (error.message == 'jwt expired') {
            const err = new Error('token expired');
            err.status = 401;
            throw err
        }
        const err = new Error(error);
        err.status = 500;
        throw err
    }
}

const signToken = (id, type = 'no Email') => {
    if (type === 'email') {
        console.log(type)
        return jwt.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: '600s'
        });
    } else {
        console.log(type)
        return jwt.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });
    }
};

module.exports = {
    foodHuts: async function () {
        try {
            const newData = await FoodHutModel.find()

            return newData
        } catch (err) {
            throw new Error("Something went worng")
        }
    },
    foodHut: async function ({ id }) {
        try {
            const newData = await FoodHutModel.findById(id).populate({ path: 'foods' }).populate({ path: 'reviews' }).populate({ path: 'chefs' })
            return newData
        } catch (err) {
            throw new Error("No FoodHut")
        }
    },
    food: async function ({ id }) {
        try {
            const newData = await FoodModel.findById(id).populate({ path: 'foodHuts' }).populate({ path: 'review' })
            return newData
        } catch (err) {
            throw new Error("No Foods")
        }
    },
    foods: async function (args, req) {
        try {
            let foods = await FoodModel.find();
            foods = select(args, foods)
            return foods;
        } catch (err) {
            throw new Error(err)
        }
    },
    createUser: async function ({ userInput }, req) {
        try {
            if (!userInput.name || !userInput.email || !userInput.password || !userInput.passwordConfirm) {
                const err = new Error('Fill All Fields');
                err.status = 400;
                throw err
            }

            const newUser = await User.create({
                name: userInput.name,
                email: userInput.email,
                password: userInput.password,
                passwordConfirm: userInput.passwordConfirm,
                photo: userInput.photo
            });
            if (!newUser) {
                const err = new Error('Could not create User');
                err.status = 500;
                throw err
            }

            const emailToken = signToken(newUser._id, 'email');
            const token = signToken(newUser._id);
            const url = `${req.protocol}://${req.get('host')}/api/v1/user/confrimEmail?user=${emailToken}&userId=${newUser._id.toString()}`;
            await new Email(newUser, url).sendWelcome();
            return {
                user: newUser,
                token
            }

        } catch (error) {
            if (error.code === 11000) {
                const err = new Error('User AllReady Exits given Email');
                err.status = 400;
                throw err
            }
            const err = new Error('Error An Occur ');
            err.status = 500;
            throw err
        }
    },
    login: async function ({ userdata }, req) {
        try {

            const { email, password } = userdata;
            if (!email || !password) {
                const err = new Error('Please provide email and password!');
                err.status = 401;
                throw err

            }
            // 2) Check if user exists && password is correct
            const user = await User.findOne({ email }).select('+password');

            if (!user || !(await user.correctPassword(password, user.password))) {
                const err = new Error('Incorrect email or password');
                err.status = 401;
                throw err
            }

            const token = signToken(user._id);

            return {
                user,
                token
            }

        } catch (error) {
            const err = new Error(error);
            err.status = 500;
            throw err
        }
    },
    forgotPassword: async function ({ userData }, req) {
        try {
            const user = await User.findOne({ email: userData.email });
            if (!user) {
                const err = new Error('There is no user with email address.');
                err.status = 400;
                throw err
            }

            const resetToken = user.createPasswordResetToken();
            await user.save({ validateBeforeSave: false });

            try {
                const resetURL = `${req.protocol}://${req.get(
                    'host'
                )}/api/v1/user/resetPassword/${resetToken}`;
                await new Email(user, resetURL).sendPasswordReset();

                return 'Token sent to email!';
            } catch (error) {
                user.passwordResetToken = undefined;
                user.passwordResetExpires = undefined;
                await user.save({ validateBeforeSave: false });
                const err = new Error('There was an error sending the email. Try again later!');
                err.status = 500;
                throw err
            }
        } catch (error) {
            const err = new Error('fail');
            err.status = 500;
            throw err

        }
    },
    getMe: async function ({ token, userId }, req) {
        const user = await protect(token, userId);

        return user;
    },
    review: async function ({ id }) {
        try {
            const review = await Review.findById(id);
            return review;
        } catch (error) {
            const err = new Error('fail');
            err.status = 400;
            throw err
        }
    },
    reviews: async function () {
        try {
            const review = await Review.find();
            return review;
        } catch (error) {
            const err = new Error('fail');
            err.status = 400;
            throw err
        }
    },
    foodHutReviews: async function () {
        try {
            const review = await FoodHutReview.find();
            return review;
        } catch (error) {
            const err = new Error('fail');
            err.status = 400;
            throw err
        }
    },
    foodHutReview: async function ({ id }) {
        try {
            const review = await FoodHutReview.findById(id);
            return review;
        } catch (error) {
            const err = new Error('fail');
            err.status = 400;
            throw err
        }
    },
    oneCart: async function ({ token, userId, id }, req) {
        try {
            const user = await protect(token, userId);
            if (!user) {
                const err = new Error('No User Found');
                err.status = 500;
                throw err
            }
            const cartItems = await CartModel.findOne({ user, _id: id });
            console.log(cartItems)
            return cartItems;
        } catch (error) {
            const err = new Error(error);
            err.status = 400;
            throw err
        }
    },
    cart: async function ({ token, userId }, req) {
        try {
            const user = await protect(token, userId);
            if (!user) {
                const err = new Error('No User Found');
                err.status = 500;
                throw err
            }
            const cartItems = await CartModel.find({ user });
            return cartItems;
        } catch (error) {
            const err = new Error(error);
            err.status = 400;
            throw err
        }
    },
    createCart: async function ({ token, userId, cart }, req) {
        try {
            const user = await protect(token, userId);
            const data = {
                "Food": cart.food,
                "user": userId
            }
            if (!user) {
                const err = new Error('No User Found');
                err.status = 500;
                throw err
            }
            const cartItem = await CartModel.findOne(cart);
            if (cartItem) {
                cartItem.quantity++;
                cartItem.save();
                return cartItem
            }

            const newCart = await CartModel.create(data)
            return res.status(201).json({
                size: newCart.length,
                status: 'success',
                data: newCart,
            })

        } catch (error) {
            const err = new Error(error.message);
            throw err
        }
    }

};
