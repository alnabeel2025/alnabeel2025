
import React, { useState, useEffect, useMemo } from 'react';
import { useSales } from '../context/SalesContext';
import { useEmployees } from '../context/EmployeeContext';
import type { SaleEntry } from '../types';

const getTodaysDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const formatCurrency = (amount: number) => {
    return amount.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' });
};

export const EmployeeView = () => {
  const { addSale, updateSale, deleteSale, state: salesState } = useSales();
  const { state: employeeState } = useEmployees();
  const currentUser = employeeState.currentUser;

  const [view, setView] = useState<'add' | 'report'>('add');
  const [editingSale, setEditingSale] = useState<SaleEntry | null>(null);

  // Form State
  const [date, setDate] = useState(getTodaysDate());
  const [networkNumber, setNetworkNumber] = useState('');
  const [mastercardAmount, setMastercardAmount] = useState('');
  const [madaAmount, setMadaAmount] = useState('');
  const [visaAmount, setVisaAmount] = useState('');
  const [gccAmount, setGccAmount] = useState('');
  const [total, setTotal] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState('');

  // Report State
  const [reportDate, setReportDate] = useState(getTodaysDate());

  useEffect(() => {
    const mc = parseFloat(mastercardAmount) || 0;
    const mada = parseFloat(madaAmount) || 0;
    const visa = parseFloat(visaAmount) || 0;
    const gcc = parseFloat(gccAmount) || 0;
    setTotal(mc + mada + visa + gcc);
  }, [mastercardAmount, madaAmount, visaAmount, gccAmount]);

  useEffect(() => {
    if (editingSale) {
      setDate(editingSale.date);
      setNetworkNumber(String(editingSale.networkNumber));
      setMastercardAmount(String(editingSale.mastercardAmount));
      setMadaAmount(String(editingSale.madaAmount));
      setVisaAmount(String(editingSale.visaAmount));
      setGccAmount(String(editingSale.gccAmount));
      setView('add');
    }
  }, [editingSale]);
  
  const resetForm = () => {
    setDate(getTodaysDate());
    setNetworkNumber('');
    setMastercardAmount('');
    setMadaAmount('');
    setVisaAmount('');
    setGccAmount('');
    setShowSuccess('');
    setEditingSale(null);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!networkNumber) {
        alert("الرجاء إدخال رقم الشبكة.");
        return;
    }
    if (!currentUser) {
        alert("خطأ: لم يتم العثور على الموظف الحالي.");
        return;
    }

    setIsSubmitting(true);
    const saleData = {
      date,
      networkNumber: parseInt(networkNumber, 10),
      mastercardAmount: parseFloat(mastercardAmount) || 0,
      madaAmount: parseFloat(madaAmount) || 0,
      visaAmount: parseFloat(visaAmount) || 0,
      gccAmount: parseFloat(gccAmount) || 0,
    };

    if (editingSale) {
      updateSale({ ...saleData, id: editingSale.id, employeeId: editingSale.employeeId, total: 0 }); // total is recalculated in context
      setShowSuccess('تم تحديث السجل بنجاح!');
    } else {
      addSale({ ...saleData, employeeId: currentUser.id });
      setShowSuccess('تمت إضافة السجل بنجاح!');
    }
    
    setTimeout(() => {
        resetForm();
        setIsSubmitting(false);
        setView('report');
    }, 2000);
  };
  
  const handleEdit = (sale: SaleEntry) => {
      setEditingSale(sale);
  };
  
  const handleDelete = (id: string) => {
      if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا السجل؟')) {
          deleteSale(id);
      }
  };

  const myEntries = useMemo(() => {
    if (!currentUser) return [];
    return salesState.sales
      .filter(s => s.employeeId === currentUser.id && s.date === reportDate)
      .sort((a,b) => a.networkNumber - b.networkNumber);
  }, [salesState.sales, currentUser, reportDate]);

  const SalesForm = (
    <>
      <h2 className="text-3xl font-bold text-center text-cyan-400 mb-6">{editingSale ? 'تعديل السجل' : 'إضافة سجل مبيعات'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-slate-300 mb-1">التاريخ</label>
          <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition" required />
        </div>
        <div>
          <label htmlFor="networkNumber" className="block text-sm font-medium text-slate-300 mb-1">رقم الشبكة</label>
          <input type="number" id="networkNumber" value={networkNumber} onChange={(e) => setNetworkNumber(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition" placeholder="مثال: 101" required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="mastercard" className="block text-sm font-medium text-slate-300 mb-1">مبلغ مستر كارد</label>
              <input type="number" step="0.01" id="mastercard" value={mastercardAmount} onChange={(e) => setMastercardAmount(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition" placeholder="0.00" />
            </div>
            <div>
              <label htmlFor="mada" className="block text-sm font-medium text-slate-300 mb-1">مدى</label>
              <input type="number" step="0.01" id="mada" value={madaAmount} onChange={(e) => setMadaAmount(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition" placeholder="0.00" />
            </div>
            <div>
              <label htmlFor="visa" className="block text-sm font-medium text-slate-300 mb-1">فيزا</label>
              <input type="number" step="0.01" id="visa" value={visaAmount} onChange={(e) => setVisaAmount(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition" placeholder="0.00" />
            </div>
            <div>
              <label htmlFor="gcc" className="block text-sm font-medium text-slate-300 mb-1">الشبكة الخليجية</label>
              <input type="number" step="0.01" id="gcc" value={gccAmount} onChange={(e) => setGccAmount(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition" placeholder="0.00" />
            </div>
        </div>
        <div className="pt-4">
          <div className="flex justify-between items-center bg-slate-900 rounded-lg p-4">
            <span className="text-lg font-bold text-slate-300">الإجمالي:</span>
            <span className="text-2xl font-bold text-cyan-400">{formatCurrency(total)}</span>
          </div>
        </div>
        <div className="flex gap-4 pt-2">
          {editingSale && (
            <button type="button" onClick={resetForm} className="w-full bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-lg transition">
              إلغاء التعديل
            </button>
          )}
          <button type="submit" disabled={isSubmitting} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:bg-slate-500 disabled:cursor-not-allowed">
            {isSubmitting ? 'جاري الحفظ...' : (editingSale ? 'حفظ التعديلات' : 'إضافة')}
          </button>
        </div>
        {showSuccess && (
            <div className="mt-4 text-center p-3 bg-green-500/20 text-green-300 rounded-lg">
                {showSuccess}
            </div>
        )}
      </form>
    </>
  );

  const ReportView = (
    <div>
        <h2 className="text-3xl font-bold text-center text-cyan-400 mb-6">عرض سجلاتي المدخلة</h2>
        <div className="mb-6 flex flex-col md:flex-row justify-center items-center gap-4">
            <label htmlFor="report-date" className="text-lg font-medium text-slate-300">اختر التاريخ:</label>
            <input type="date" id="report-date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} className="bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition w-full md:w-auto" />
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-900/50">
                    <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-cyan-300 uppercase">رقم الشبكة</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-cyan-300 uppercase">الإجمالي</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-cyan-300 uppercase">إجراءات</th>
                    </tr>
                </thead>
                <tbody className="bg-slate-800 divide-y divide-slate-700">
                  {myEntries.length > 0 ? (
                    myEntries.map((sale) => (
                      <tr key={sale.id} className="hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-4">{sale.networkNumber}</td>
                        <td className="px-6 py-4 font-bold text-cyan-400">{formatCurrency(sale.total)}</td>
                        <td className="px-6 py-4 space-x-4 space-x-reverse">
                          <button onClick={() => handleEdit(sale)} className="text-cyan-400 hover:text-cyan-300 transition">تعديل</button>
                          <button onClick={() => handleDelete(sale.id)} className="text-red-500 hover:text-red-400 transition">حذف</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={3} className="text-center py-10 px-6 text-slate-400">لا توجد سجلات لك في هذا اليوم.</td></tr>
                  )}
                </tbody>
            </table>
        </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto p-6 md:p-8 bg-slate-800 rounded-2xl shadow-2xl">
      <div className="flex justify-center border-b border-slate-700 mb-6">
        <button
          onClick={() => {
            if (editingSale) {
                resetForm();
            }
            setView('add');
          }}
          className={`px-6 py-3 font-bold transition ${view === 'add' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'}`}
        >
          {editingSale ? 'تعديل سجل' : 'إضافة سجل'}
        </button>
        <button
          onClick={() => {
            setEditingSale(null);
            setView('report');
          }}
          className={`px-6 py-3 font-bold transition ${view === 'report' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'}`}
        >
          عرض سجلاتي
        </button>
      </div>

      {view === 'add' ? SalesForm : ReportView}
    </div>
  );
};