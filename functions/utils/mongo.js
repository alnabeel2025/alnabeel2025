const { MongoClient } = require('mongodb');

// متغير لتخزين الاتصال بقاعدة البيانات
let cachedDb = null;

// دالة للاتصال بقاعدة البيانات
async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  // التأكد من وجود متغير البيئة
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME || 'pos_db';

  if (!uri) {
    throw new Error('MONGODB_URI is not set in environment variables.');
  }

  // إنشاء عميل MongoDB جديد
  const client = new MongoClient(uri);

  // الاتصال بالخادم
  await client.connect();

  // اختيار قاعدة البيانات
  const db = client.db(dbName);

  // تخزين الاتصال في المتغير المؤقت
  cachedDb = db;
  return db;
}

module.exports = { connectToDatabase };
