const { buildSchema } = require('graphql');

module.exports = buildSchema(`
    type Food {
        _id: ID
        name: String
        slug: String
        img: [String!]
        description: String
        likes: Int
        unLikes: Int
        ratingsAverage: Int
        ratingsQuantity: Int
        coverImg: String
        nutritionPer100g: NutritionPer100g
        nutritionPer100ml: NutritionPer100ml
        tags: [String]
        price: Int
        like: Boolean
        foodHuts: [String]
        review:[String]
        offer:Boolean
    }

    type FoodOne {
        _id: ID
        name: String
        slug: String
        img: [String!]
        description: String
        likes: Int
        unLikes: Int
        ratingsAverage: Int
        ratingsQuantity: Int
        coverImg: String
        nutritionPer100g: NutritionPer100g
        nutritionPer100ml: NutritionPer100ml
        tags: [String]
        price: Int
        like: Boolean
        foodHuts: [FoodHuts]
        review:[Review]
        offer:Boolean
    }

    

    type location {
        type: String
        coordinates: [Int]
        address: String
        description: String
    }

    type Review {
        _id: ID
        review: String
        rating: Int
        createdAt: String
        Food: String
        user: ReviewUser
    }

    type ReviewUser {
        photo: String
        _id: String
        name: String
    }

    type FoodHutReview {
        _id: ID
        FoodHutReview: String
        rating: Int
        createdAt: String
        FoodHut:String
        user: ReviewUser
    }

    type User {
        _id: ID
        name: String
        emailConfrim: Boolean
        email: String
        Likes: [String]
        photo: String
        role: String
        password: String
        passwordConfirm: String
        passwordChangedAt: String
        passwordResetToken: String
        passwordResetExpires: String
        active: Boolean
        review: [String]
        address: String
    }

    type FoodHut {
        _id: ID
        name: String
        slug: String
        GroupSizePerTable: Int
        ratingsAverage: Int
        ratingsQuantity: Int
        summary: String
        description: String
        imageCover: String
        images: [String]
        openAt: String
        Location: location
        reviews: [FoodHutReview]
        foods: [Food]
        chefs: [User]
    }

    type FoodHuts {
        _id: ID
        name: String
        slug: String
        GroupSizePerTable: Int
        ratingsAverage: Int
        ratingsQuantity: Int
        summary: String
        description: String
        imageCover: String
        images: [String]
        openAt: String
        Location: location
        reviews: [String]
        foods: [String]
        chefs: [String]
    }

    type NutritionPer100g {
        Calcium: Int
        Carbohydrate: Int
        DietaryFibre: Int
        Energy: Int
        Fat: Int
        Iron: Int
        Magnesium: Int
        Manganese: Int
        MonounsaturatedFat: Int
        Omega3FattyAcid: Int
        Phosphorus: Int
        PolyunsaturatedFat: Int
        Potassium: Int
        Protein: Int
        SaturatedFat: Int
        Sodium: Int
        Starch: Int
        Sugars: Int
        TransFat: Int
        VitaminA: Int
        VitaminB1: Int
        VitaminB2: Int
        VitaminB3: Int
        VitaminB5: Int
        VitaminB6: Int
        VitaminB9: Int
        VitaminC: Int
        VitaminE: Int
        Vitamink: Int
        Zinc: Int
    }

    type Refund {
        _id: ID
        user: User
        Food: Food
        price: Int
        evidence: [String]
        feedback: String
        quantity: Int
        createdAt: String
        why: String
        success: Boolean
    }

    type Order {
        _id: ID!
        user: User!
        food: Food!
        price: Int!
        quantity: Int!
        orderAt: String!
        delivered: Boolean!
        confrimRecive: Boolean!
    }

    type Cart {
        _id: ID
        user: User
        Food: Food
        price: Int
        quantity: Int
        createdAt: String
    }

    type NutritionPer100ml {
        Calcium: Int
        Carbohydrate: Int
        DietaryFibre: Int
        Energy: Int
        Fat: Int
        MonounsaturatedFat: Int
        PolyunsaturatedFat: Int
        Potassium: Int
        Protein: Int
        SaturatedFat: Int
        Sodium: Int
        Sugars: Int
        TransFat: Int
        VitaminE: Int
    }

    input UserInputData {
        name: String!
        email: String!
        password:String!
        passwordConfirm: String!
    }

    type Signup {
        user: User!
        token: String!
    }

    type LogIn {
        user: User!
        token: String!
    }

    
    input UserData {
        email: String!
        password:String!
    }

    input ForgetPass {
        email:String!
    }

    input cartItem {
       food:String
    }

    input ratingInput {
        type:String!
        rate:Int!
    }


    input foodFilter {
        type:String!
        rate:Int!
        field:String!
    }

    type RootQuery {
        foods(tags:String,rating:ratingInput,likes:ratingInput,nutritionPer100g:foodFilter,nutritionPer100ml:foodFilter):[Food]!
        food(id:ID):FoodOne!
        foodHut(id:ID):FoodHut!
        foodHuts:[FoodHuts]!
        reviews:[Review]!
        review(id:ID):Review!
        foodHutReviews:[FoodHutReview!]
        foodHutReview(id:ID):FoodHutReview!
        cart(token:String,userId:String):[Cart!]
        oneCart(token:String,userId:String,id:ID):Cart!
        getMe(token:String,userId:String):User!
    }

     
    type RootMutation {
        createUser(userInput: UserInputData): Signup!
        login(userdata:UserData ):LogIn!
        forgotPassword(userData:ForgetPass):String!
    }


    schema {
        query: RootQuery
        mutation: RootMutation
    }
    
`);