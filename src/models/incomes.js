// load mongoose
const {mongoose} = require('./../db/mongoose');

// Schema for Income
let Schema = mongoose.Schema;

const incomeSchema = new Schema({
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
  }
});

// create model
const incomes = mongoose.model('incomes', incomeSchema);

// export
module.exports = {incomes};
