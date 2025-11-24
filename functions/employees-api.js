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

// دالة مساعدة لتحويل معرفات MongoDB إلى سلاسل نصية
const transformEmployee = (employee) => {
  if (!employee) return null;
  const { _id, ...rest } = employee;
  return { id: _id.toString(), ...rest };
};

const employeesHandler = async (event) => {
  // التعامل مع طلبات OPTIONS أولاً
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  try {
    const db = await connectToDatabase();
    const collection = db.collection('employees');
    const { httpMethod, path, body } = event;

    // استخراج المعرف من المسار إذا كان موجودًا
    const parts = path.split('/').filter(p => p.length > 0);
    const id = parts.length > 1 ? parts[parts.length - 1] : null;

    switch (httpMethod) {
      case 'GET':
        // GET /employees-api (جلب الكل)
        if (!id || id === 'employees-api') {
          const employees = await collection.find({}).toArray();
          return sendResponse(200, employees.map(transformEmployee));
        }
        // GET /employees-api/{id} (جلب موظف واحد)
        try {
          const employee = await collection.findOne({ _id: new ObjectId(id) });
          if (!employee) {
            return sendResponse(404, { message: 'Employee not found' });
          }
          return sendResponse(200, transformEmployee(employee));
        } catch (e) {
          return sendResponse(400, { message: 'Invalid ID format' });
        }

      case 'POST':
        // POST /employees-api (إضافة موظف جديد)
        const newEmployeeData = JSON.parse(body);
        // في تطبيق حقيقي، يجب تشفير كلمة المرور هنا
        const result = await collection.insertOne(newEmployeeData);
        const addedEmployee = await collection.findOne({ _id: result.insertedId });
        return sendResponse(201, transformEmployee(addedEmployee));

      case 'PUT':
        // PUT /employees-api/{id} (تحديث موظف)
        if (!id) return sendResponse(400, { message: 'Missing employee ID' });
        const updateData = JSON.parse(body);
        delete updateData.id; // إزالة المعرف من البيانات لمنع التحديث
        const updateResult = await collection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );
        if (updateResult.matchedCount === 0) {
          return sendResponse(404, { message: 'Employee not found' });
        }
        const updatedEmployee = await collection.findOne({ _id: new ObjectId(id) });
        return sendResponse(200, transformEmployee(updatedEmployee));

      case 'DELETE':
        // DELETE /employees-api/{id} (حذف موظف)
        if (!id) return sendResponse(400, { message: 'Missing employee ID' });
        const deleteResult = await collection.deleteOne({ _id: new ObjectId(id) });
        if (deleteResult.deletedCount === 0) {
          return sendResponse(404, { message: 'Employee not found' });
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

exports.handler = employeesHandler;
