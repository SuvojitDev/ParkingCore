// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const roles = ["Admin", "Manager", "Customer"];

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true, trim: true, },
    password: { type: String, required: true, select: false, trim: true },
    role: { type: String, enum: roles, default: "Customer", index: true,  trim: true },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true, versionKey: false }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model("User", UserSchema);
module.exports.ROLES = roles;