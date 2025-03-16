const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "User email is required"],
      trim: true,
      unique: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i, // Simplified validation
    },

    password: {
      type: String,
      required: [true, "User password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
    },

    refreshToken: { type: String },
  },
  { timestamps: true } // Automatically adds createdAt & updatedAt
);

// 🔒 Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 🔑 Compare password method
UserSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// 🚀 Export model (Prevents re-declaring in Next.js or hot-reload environments)
const User = mongoose.models.User || mongoose.model("User", UserSchema);
module.exports = User;
