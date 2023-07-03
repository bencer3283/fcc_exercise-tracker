let mongoose = require('mongoose');

const exerciseSchema = mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        reauired: true
    },
    date: {
        type: Date,
        default: Date() //a Date object of current time
    }
})

const userSchema = mongoose.Schema({
    username: {
        type: String,
        require: true
    },
    exercises: [exerciseSchema]
})

const exerciseModel = mongoose.model('Exercise', exerciseSchema);
const userModel =  mongoose.model('User', userSchema);

module.exports = { exerciseModel, userModel };