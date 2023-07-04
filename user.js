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
        type: Number,
        default: Date.now() //a timestamp of current time
    },
    parentId: {
        type: String,
    }
});

const userSchema = mongoose.Schema({
    username: {
        type: String,
        require: true
    },
    exercises: [exerciseSchema]
}, {
    methods: {
        countExercises() {
            return this.exercises.length;
        }
    }
})


const exerciseModel = mongoose.model('Exercise', exerciseSchema);
const userModel =  mongoose.model('User', userSchema);

module.exports = { exerciseModel, userModel };