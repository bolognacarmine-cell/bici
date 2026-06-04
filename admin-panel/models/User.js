const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, default: 'admin' },
  },
  { timestamps: true }
)

UserSchema.pre('save', async function hashPassword(next) {
  try {
    if (!this.isModified('password')) return next()
    const saltRounds = 10
    this.password = await bcrypt.hash(this.password, saltRounds)
    next()
  } catch (err) {
    next(err)
  }
})

UserSchema.methods.comparePassword = async function comparePassword(candidate) {
  return bcrypt.compare(String(candidate), this.password)
}

module.exports = mongoose.model('User', UserSchema)

