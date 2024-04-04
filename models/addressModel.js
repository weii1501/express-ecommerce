const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  addressLine1: {
    type: String,
    required: true
  },
  addressLine2: {
    type: String
  },
  city: {
    type: String,
    required: true
  },
  province: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  country: {
    type: String,
    default: 'Vietnam'
  }
});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;