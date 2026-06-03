import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ SUPER MONGODB CONECTADO - FRANKY APROVEA!');
    process.exit(0);
  } catch (e) {
    console.error('❌ ERROR', e);
    process.exit(1);
  }
}
test();
