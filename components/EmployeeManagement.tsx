
import React, { useState } from 'react';
import { useEmployees } from '../context/EmployeeContext';
import type { Employee } from '../types';

const EmployeeFormModal = ({
  isOpen,
  onClose,
  employee,
}: {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
}) => {
  const { addEmployee, updateEmployee } = useEmployees();
  const [name, setName] = useState(employee?.name || '');
  const [username, setUsername] = useState(employee?.username || '');
  const [password, setPassword] = useState('');
  const [branch, setBranch] = useState<Employee['branch']>(employee?.branch || 'فرع طويق');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (employee) { // Editing
      updateEmployee({ ...employee, name, username, branch, password_hash: password || employee.password_hash });
    } else { // Adding
      if (!password) {
          alert('كلمة المرور مطلوبة.');
          return;
      }
      addEmployee({ name, username, branch, password_hash: password });
    }
    onClose();
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-md">
        <h3 className="text-2xl font-bold text-cyan-400 mb-6">{employee ? 'تعديل موظف' : 'إضافة موظف جديد'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="اسم الموظف" className="w-full bg-slate-700 p-3 rounded-lg" required />
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="اسم المستخدم" className="w-full bg-slate-700 p-3 rounded-lg" required />
          <input type="password" onChange={e => setPassword(e.target.value)} placeholder={employee ? 'اترك الحقل فارغاً لعدم التغيير' : 'كلمة المرور'} className="w-full bg-slate-700 p-3 rounded-lg" required={!employee} />
          <select value={branch} onChange={e => setBranch(e.target.value as Employee['branch'])} className="w-full bg-slate-700 p-3 rounded-lg">
            <option value="فرع طويق">فرع طويق</option>
            <option value="فرع الحزم">فرع الحزم</option>
            <option value="فرع عكاظ">فرع عكاظ</option>
          </select>
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="w-full bg-slate-600 hover:bg-slate-700 p-3 rounded-lg transition">إلغاء</button>
            <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 p-3 rounded-lg transition">حفظ</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const EmployeeManagement = () => {
  const { state, deleteEmployee } = useEmployees();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const handleAdd = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا الموظف؟')) {
      deleteEmployee(id);
    }
  };

  return (
    <div>
        <div className="flex justify-end mb-6">
            <button onClick={handleAdd} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition">
                + إضافة موظف
            </button>
        </div>

        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-900/50">
                    <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-cyan-300 uppercase">اسم الموظف</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-cyan-300 uppercase">اسم المستخدم</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-cyan-300 uppercase">الفرع</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-cyan-300 uppercase">إجراءات</th>
                    </tr>
                </thead>
                <tbody className="bg-slate-800 divide-y divide-slate-700">
                    {state.employees.map(emp => (
                        <tr key={emp.id}>
                            <td className="px-6 py-4 whitespace-nowrap">{emp.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{emp.username}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{emp.branch}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4 space-x-reverse">
                                <button onClick={() => handleEdit(emp)} className="text-cyan-400 hover:text-cyan-300 transition">تعديل</button>
                                <button onClick={() => handleDelete(emp.id)} className="text-red-500 hover:text-red-400 transition">حذف</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        <EmployeeFormModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            employee={editingEmployee}
        />
    </div>
  );
};