const { connectToDatabase } = require('./utils/mongo');
const { ObjectId } = require('mongodb');

// دالة مساعدة لإرسال استجابة JSON
const sendResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  },
  body: JSON.stringify(body),
});

// دالة مساعدة للتعامل مع OPTIONS
const handleOptions = () => sendResponse(204, {});

// دالة لحساب الإجمالي
const calculateTotal = (sale) => {
  return sale.mastercardAmount + sale.madaAmount + sale.visaAmount + sale.gccAmount;
};

// تحويل Mongo ObjectId إلى نص
const transformSale = (sale) => {
  if (!sale) return null;
  const { _id, employeeId, ...rest } = sale;
  return { 
    id: _id.toString(), 
    employeeId: employeeId.toString(),
    ...rest 
  };
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions();

  try {
    const db = await connectToDatabase();
    const collection = db.collection('sales');
    const { httpMethod, path, body } = event;

    const parts = path.split('/').filter(Boolean);
    const id = parts.length > 1 ? parts[parts.length - 1] : null;

    switch (httpMethod) {
      case 'GET':
        if (!id || id === 'sales-api') {
          const sales = await collection.find({}).toArray();
          return sendResponse(200, sales.map(transformSale));
        }
        try {
          const sale = await collection.findOne({ _id: new ObjectId(id) });
          return sale ? sendResponse(200, transformSale(sale)) : sendResponse(404, { message: 'Sale not found' });
        } catch {
          return sendResponse(400, { message: 'Invalid ID format' });
        }

      case 'POST':
        const newSaleData = JSON.parse(body);
        const saleToInsert = {
          ...newSaleData,
          total: calculateTotal(newSaleData),
          employeeId: new ObjectId(newSaleData.employeeId),
        };
        const insertResult = await collection.insertOne(saleToInsert);
        const addedSale = await collection.findOne({ _id: insertResult.insertedId });
        return sendResponse(201, transformSale(addedSale));

      case 'PUT':
        if (!id) return sendResponse(400, { message: 'Missing sale ID' });

        const updateData = JSON.parse(body);
        delete updateData.id;

        const saleToUpdate = {
          ...updateData,
          total: calculateTotal(updateData),
          employeeId: new ObjectId(updateData.employeeId),
        };

        const updateResult = await collection.updateOne(
          { _id: new ObjectId(id) },
          { $set: saleToUpdate }
        );

        if (!updateResult.matchedCount) return sendResponse(404, { message: 'Sale not found' });

        const updatedSale = await collection.findOne({ _id: new ObjectId(id) });
        return sendResponse(200, transformSale(updatedSale));

      case 'DELETE':
        if (!id) return sendResponse(400, { message: 'Missing sale ID' });

        const deleteResult = await collection.deleteOne({ _id: new ObjectId(id) });
        return deleteResult.deletedCount
          ? sendResponse(204, {})
          : sendResponse(404, { message: 'Sale not found' });

      default:
        return sendResponse(405, { message: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Database Error:', error);
    return sendResponse(500, { message: 'Internal Server Error', error: error.message });
  }
};
