require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const result = await User.updateOne(
    { username: 'admin' },
    { isBanned: false, role: 'admin' }
  );
  console.log('Admin fixed:', result.modifiedCount ? 'OK' : 'not found');

  // Agar admin yo'q bo'lsa yaratamiz
  const admin = await User.findOne({ username: 'admin' });
  if (!admin) {
    await User.create({
      fullName: 'Admin', username: 'admin', phone: '9001234567',
      countryCode: '+998', password: 'admin123', age: 30, role: 'admin', isBanned: false
    });
    console.log('Admin created: admin / admin123');
  } else {
    console.log('Admin status:', admin.role, '| banned:', admin.isBanned);
  }
  process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
