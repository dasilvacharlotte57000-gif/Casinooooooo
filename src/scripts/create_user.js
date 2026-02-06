const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true }
  },
  { timestamps: true }
);

const User = mongoose.model('User', UserSchema);

(async () => {
  try {
    const mongoUrl = process.env.MONGODB_URI;
    if (!mongoUrl) throw new Error('MONGODB_URI introuvable dans .env');
    await mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });

    const email = 'service@diamond-casino.com';
    const pass = 'DRTjgu754';

    const existing = await User.findOne({ email });
    if (existing) {
      console.log('Utilisateur existe déjà:', email);
      process.exit(0);
    }

    const hash = await bcrypt.hash(pass, 12);
    await User.create({ email, passwordHash: hash });
    console.log('Utilisateur créé:', email);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
