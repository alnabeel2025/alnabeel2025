
import React, { useState, useMemo } from 'react';
import type { SaleEntry } from '../types';
import { useSales } from '../context/SalesContext';
import { useEmployees } from '../context/EmployeeContext';
import { EmployeeManagement } from './EmployeeManagement';

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

const SalesReport = () => {
  const { state: salesState } = useSales();
  const { state: employeeState } = useEmployees();
  const [selectedDate, setSelectedDate] = useState(getTodaysDate());
  const [reportData, setReportData] = useState<SaleEntry[] | null>(null);

  const employeeNameMap = useMemo(() => {
    const map = new Map<string, string>();
    employeeState.employees.forEach(emp => {
      map.set(emp.id, emp.name);
    });
    return map;
  }, [employeeState.employees]);

  const handleReview = () => {
    const data = salesState.sales
      .filter(sale => sale.date === selectedDate)
      .sort((a,b) => a.networkNumber - b.networkNumber);
    setReportData(data);
  };

  const handlePrint = () => {
    window.print();
  };
  
  const totals = useMemo(() => {
    if (!reportData) {
        return { mastercard: 0, mada: 0, visa: 0, gcc: 0, grandTotal: 0 };
    }
    return reportData.reduce((acc, sale) => {
      acc.mastercard += sale.mastercardAmount;
      acc.mada += sale.madaAmount;
      acc.visa += sale.visaAmount;
      acc.gcc += sale.gccAmount;
      acc.grandTotal += sale.total;
      return acc;
    }, { mastercard: 0, mada: 0, visa: 0, gcc: 0, grandTotal: 0 });
  }, [reportData]);

  const handleDownloadCSV = () => {
    if (!reportData || reportData.length === 0) return;

    const headers = [
        'اسم الموظف',
        'رقم الشبكة',
        'مستر كارد',
        'مدى',
        'فيزا',
        'الشبكة الخليجية',
        'الإجمالي'
    ];

    const rows = reportData.map(sale => [
        `"${employeeNameMap.get(sale.employeeId) || 'غير معروف'}"`,
        sale.networkNumber,
        sale.mastercardAmount,
        sale.madaAmount,
        sale.visaAmount,
        sale.gccAmount,
        sale.total
    ].join(','));

    const totalsRow = [
        '"إجمالي كل شبكة"',
        '', // for network number
        totals.mastercard,
        totals.mada,
        totals.visa,
        totals.gcc,
        totals.grandTotal
    ].join(',');

    const csvContent = [
        headers.join(','),
        ...rows,
        '', // empty line for separation
        totalsRow
    ].join('\n');
    
    // The \uFEFF is a BOM to force Excel to read the file as UTF-8
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `sales-report-${selectedDate}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  return (
      <>
        <div className="no-print">
            <div className="mb-6 flex flex-col md:flex-row justify-center items-center gap-4">
              <label htmlFor="report-date" className="text-lg font-medium text-slate-300">اختر تاريخ التقرير:</label>
              <input
                type="date"
                id="report-date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition w-full md:w-auto"
              />
              <button
                onClick={handleReview}
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition"
              >
                استعراض
              </button>
            </div>
          </div>
          <div id="printable-area">
            <div className="print-only text-center mb-6">
                <h3 className="text-2xl font-bold">تقرير المبيعات ليوم: {selectedDate}</h3>
                <p className="text-sm">نظام إدارة نقاط البيع</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-cyan-300 uppercase tracking-wider">اسم الموظف</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-cyan-300 uppercase tracking-wider">رقم الشبكة</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-cyan-300 uppercase tracking-wider">مستر كارد</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-cyan-300 uppercase tracking-wider">مدى</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-cyan-300 uppercase tracking-wider">فيزا</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-cyan-300 uppercase tracking-wider">الشبكة الخليجية</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-cyan-300 uppercase tracking-wider">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="bg-slate-800 divide-y divide-slate-700">
                  {reportData === null ? (
                      <tr><td colSpan={7} className="text-center py-10 px-6 text-slate-400">الرجاء تحديد تاريخ والضغط على "استعراض" لعرض البيانات.</td></tr>
                  ) : reportData.length > 0 ? (
                    reportData.map((sale) => (
                      <tr key={sale.id} className="hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-4">{employeeNameMap.get(sale.employeeId) || 'غير معروف'}</td>
                        <td className="px-6 py-4">{sale.networkNumber}</td>
                        <td className="px-6 py-4">{formatCurrency(sale.mastercardAmount)}</td>
                        <td className="px-6 py-4">{formatCurrency(sale.madaAmount)}</td>
                        <td className="px-6 py-4">{formatCurrency(sale.visaAmount)}</td>
                        <td className="px-6 py-4">{formatCurrency(sale.gccAmount)}</td>
                        <td className="px-6 py-4 font-bold text-cyan-400">{formatCurrency(sale.total)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={7} className="text-center py-10 px-6 text-slate-400">لا توجد سجلات لهذا اليوم.</td></tr>
                  )}
                </tbody>
                {reportData && reportData.length > 0 && (
                  <tfoot className="bg-slate-900">
                      <tr>
                          <td colSpan={2} className="px-6 py-4 font-bold">إجمالي كل شبكة</td>
                          <td className="px-6 py-4 font-bold">{formatCurrency(totals.mastercard)}</td>
                          <td className="px-6 py-4 font-bold">{formatCurrency(totals.mada)}</td>
                          <td className="px-6 py-4 font-bold">{formatCurrency(totals.visa)}</td>
                          <td className="px-6 py-4 font-bold">{formatCurrency(totals.gcc)}</td>
                          <td className="px-6 py-4 text-lg font-extrabold text-cyan-300">{formatCurrency(totals.grandTotal)}</td>
                      </tr>
                  </tfoot>
                )}
              </table>
            </div>
            {reportData && reportData.length > 0 && (
              <div className="mt-6 p-6 bg-slate-900 rounded-xl flex justify-between items-center">
                  <h3 className="text-xl font-bold">الإجمالي الكلي لليوم:</h3>
                  <p className="text-3xl font-extrabold text-cyan-400">{formatCurrency(totals.grandTotal)}</p>
              </div>
            )}
          </div>
          {reportData && reportData.length > 0 && (
            <div className="text-center mt-8 no-print flex justify-center gap-4">
                <button onClick={handlePrint} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition">طباعة / تحميل PDF</button>
                <button onClick={handleDownloadCSV} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition">تحميل تقرير (CSV)</button>
            </div>
          )}
      </>
  );
};

export const AdminView = () => {
    const [subView, setSubView] = useState<'reports' | 'employees'>('reports');

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-6 bg-slate-800 rounded-2xl shadow-2xl">
            <h2 className="text-3xl font-bold text-center text-cyan-400 mb-6">لوحة تحكم الإدارة</h2>
            
            <div className="mb-6 border-b border-slate-700 flex justify-center no-print">
                <button
                    onClick={() => setSubView('reports')}
                    className={`px-6 py-3 font-bold transition ${subView === 'reports' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'}`}
                >
                    تقرير المبيعات
                </button>
                <button
                    onClick={() => setSubView('employees')}
                    className={`px-6 py-3 font-bold transition ${subView === 'employees' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'}`}
                >
                    إدارة الموظفين
                </button>
            </div>

            {subView === 'reports' ? <SalesReport /> : <EmployeeManagement />}
        </div>
    );
};
