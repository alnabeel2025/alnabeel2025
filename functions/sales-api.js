const { connectToDatabase } = require('./utils/mongo');
const { ObjectId } = require('mongodb');
const { handler } = require('@netlify/functions');

// دالة مساعدة لإرسال استجابة JSON
const sendResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*', // السماح بالوصول من أي مصدر (للتطوير)
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  },
  body: JSON.stringify(body),
});

// دالة مساعدة للتعامل مع طلبات OPTIONS (CORS Preflight)
const handleOptions = () => sendResponse(204, {});

// دالة مساعدة لحساب الإجمالي
const calculateTotal = (sale) => {
    return sale.mastercardAmount + sale.madaAmount + sale.visaAmount + sale.gccAmount;
};

// دالة مساعدة لتحويل معرفات MongoDB إلى سلاسل نصية
const transformSale = (sale) => {
  if (!sale) return null;
  const { _id, employeeId, ...rest } = sale;
  return { 
    id: _id.toString(), 
    employeeId: employeeId.toString(), // تحويل employeeId إلى سلسلة نصية
    ...rest 
  };
};

const salesHandler = async (event) => {
  // التعامل مع طلبات OPTIONS أولاً
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  try {
    const db = await connectToDatabase();
    const collection = db.collection('sales');
    const { httpMethod, path, body } = event;

    // استخراج المعرف من المسار إذا كان موجودًا
    const parts = path.split('/').filter(p => p.length > 0);
    const id = parts.length > 1 ? parts[parts.length - 1] : null;

    switch (httpMethod) {
      case 'GET':
        // GET /sales-api (جلب الكل)
        if (!id || id === 'sales-api') {
          const sales = await collection.find({}).toArray();
          return sendResponse(200, sales.map(transformSale));
        }
        // GET /sales-api/{id} (جلب عملية بيع واحدة)
        try {
          const sale = await collection.findOne({ _id: new ObjectId(id) });
          if (!sale) {
            return sendResponse(404, { message: 'Sale not found' });
          }
          return sendResponse(200, transformSale(sale));
        } catch (e) {
          return sendResponse(400, { message: 'Invalid ID format' });
        }

      case 'POST':
        // POST /sales-api (إضافة عملية بيع جديدة)
        const newSaleData = JSON.parse(body);
        const totalPost = calculateTotal(newSaleData);
        const saleToInsert = {
            ...newSaleData,
            total: totalPost,
            employeeId: new ObjectId(newSaleData.employeeId) // تحويل employeeId إلى ObjectId
        };
        const result = await collection.insertOne(saleToInsert);
        const addedSale = await collection.findOne({ _id: result.insertedId });
        return sendResponse(201, transformSale(addedSale));

      case 'PUT':
        // PUT /sales-api/{id} (تحديث عملية بيع)
        if (!id) return sendResponse(400, { message: 'Missing sale ID' });
        const updateData = JSON.parse(body);
        delete updateData.id; // إزالة المعرف من البيانات لمنع التحديث
        const totalPut = calculateTotal(updateData);
        const saleToUpdate = {
            ...updateData,
            total: totalPut,
            employeeId: new ObjectId(updateData.employeeId) // تحويل employeeId إلى ObjectId
        };
        
        const updateResult = await collection.updateOne(
          { _id: new ObjectId(id) },
          { $set: saleToUpdate }
        );
        if (updateResult.matchedCount === 0) {
          return sendResponse(404, { message: 'Sale not found' });
        }
        const updatedSale = await collection.findOne({ _id: new ObjectId(id) });
        return sendResponse(200, transformSale(updatedSale));

      case 'DELETE':
        // DELETE /sales-api/{id} (حذف عملية بيع)
        if (!id) return sendResponse(400, { message: 'Missing sale ID' });
        const deleteResult = await collection.deleteOne({ _id: new ObjectId(id) });
        if (deleteResult.deletedCount === 0) {
          return sendResponse(404, { message: 'Sale not found' });
        }
        return sendResponse(204, {}); // لا يوجد محتوى عند الحذف الناجح

      default:
        return sendResponse(405, { message: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Database Error:', error);
    return sendResponse(500, { message: 'Internal Server Error', error: error.message });
  }
};

exports.handler = salesHandler;
