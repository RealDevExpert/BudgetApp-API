// load mongoose
const {mongoose} = require('./../db/mongoose');

// Schema
const Schema = mongoose.Schema;
const expenseSchema = new Schema({
    description: {
      type: String,
      required: true,
      unique: false,
      trim: true,
      minlength: 1
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    created: {
      type: Date,
      default: Date.now
    },
    updated: {
      type: Date,
      default: Date.now
    },
    creator_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    percent: {
      type: Number,
      default: 0
    }
  });


// create model
const expenses = mongoose.model('expenses', expenseSchema);

// export
module.exports = {
  expenses
};
