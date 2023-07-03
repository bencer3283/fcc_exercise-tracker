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
        default: new Date() //a Date object of current time
    }
})

const userSchema = mongoose.Schema({
    username: {
        type: String,
        require: true
    },
    exercise: [exerciseSchema]
})

module.exports = mongoose.model('User', userSchema);