const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true, unique: true, index: true },
  pin: { type: String },
  accountNumber: { type: String, unique: true, index: true },
  balance: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  profilePicture: { type: String },
  address: { type: String },
  email: { type: String }
}, { timestamps: true });

userSchema.methods.comparePin = async function(enteredPin) {
  if (!this.pin) return false;
  return await bcrypt.compare(enteredPin, this.pin);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.pin;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
