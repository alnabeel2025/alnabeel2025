# مخطط قاعدة بيانات MongoDB المقترح

لربط التطبيق بقاعدة بيانات MongoDB Atlas، سنستخدم مجموعتين (Collections) رئيسيتين: `employees` و `sales`.

## 1. مجموعة `employees` (الموظفين)

| الحقل | النوع | الوصف | ملاحظات |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | المعرف الفريد للموظف | يتم إنشاؤه تلقائيًا بواسطة MongoDB. |
| `name` | `string` | اسم الموظف الكامل | |
| `username` | `string` | اسم المستخدم لتسجيل الدخول | يجب أن يكون فريدًا. |
| `password_hash` | `string` | كلمة المرور المشفرة | سنستخدم تشفير `bcrypt` في الواجهة الخلفية. |
| `branch` | `string` | الفرع الذي يعمل به الموظف | |

**مثال على مستند:**

```json
{
  "_id": ObjectId("60d5ec49f13c5a0015b6d5c1"),
  "name": "أحمد محمود",
  "username": "ahmed",
  "password_hash": "$2b$10$...",
  "branch": "فرع طويق"
}
```

## 2. مجموعة `sales` (المبيعات)

| الحقل | النوع | الوصف | ملاحظات |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | المعرف الفريد لعملية البيع | يتم إنشاؤه تلقائيًا بواسطة MongoDB. |
| `date` | `string` | تاريخ عملية البيع (YYYY-MM-DD) | |
| `networkNumber` | `number` | رقم الشبكة (رقم الجهاز) | |
| `mastercardAmount` | `number` | مبلغ المبيعات عبر ماستركارد | |
| `madaAmount` | `number` | مبلغ المبيعات عبر مدى | |
| `visaAmount` | `number` | مبلغ المبيعات عبر فيزا | |
| `gccAmount` | `number` | مبلغ المبيعات عبر دول مجلس التعاون الخليجي | |
| `total` | `number` | إجمالي مبلغ المبيعات | يتم حسابه في الواجهة الخلفية. |
| `employeeId` | `ObjectId` | معرف الموظف الذي قام بالبيع | ربط مع مجموعة `employees`. |

**مثال على مستند:**

```json
{
  "_id": ObjectId("60d5ec49f13c5a0015b6d5c2"),
  "date": "2025-11-25",
  "networkNumber": 101,
  "mastercardAmount": 150.50,
  "madaAmount": 2000,
  "visaAmount": 500,
  "gccAmount": 120,
  "total": 2770.50,
  "employeeId": ObjectId("60d5ec49f13c5a0015b6d5c1")
}
```
