import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AuthGuard from '@/components/admin/AuthGuard';
import { Link } from 'react-router-dom';
import { Home, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Feedback {
  id: string;
  customer_name: string;
  quality_rating: number;
  app_rating: number;
  suggestion?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
}

const FeedbacksAdmin: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const fetchFeedbacks = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });
    if (error) setError('حدث خطأ أثناء جلب التقييمات');
    else setFeedbacks(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا التقييم؟')) return;
    setDeletingId(id);
    const { error } = await supabase.from('feedback').delete().eq('id', id);
    if (!error) setFeedbacks(f => f.filter(fb => fb.id !== id));
    setDeletingId(null);
  };

  // تصدير إلى Excel
  const handleExport = () => {
    const exportData = filteredFeedbacks.map(fb => ({
      'اسم العميل': fb.customer_name,
      'تقييم الجودة': fb.quality_rating,
      'تقييم البرنامج': fb.app_rating,
      'الاقتراح': fb.suggestion || '-',
      'الموقع الجغرافي': fb.latitude && fb.longitude ? `${fb.latitude},${fb.longitude}` : '-',
      'التاريخ': new Date(fb.created_at).toLocaleString('ar-EG'),
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'التقييمات');
    XLSX.writeFile(wb, 'feedbacks.xlsx');
  };

  // فلترة وبحث
  const filteredFeedbacks = feedbacks.filter(fb => {
    const matchesSearch =
      fb.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      (fb.suggestion || '').toLowerCase().includes(search.toLowerCase());
    const matchesRating = filterRating ? fb.quality_rating === filterRating : true;
    return matchesSearch && matchesRating;
  });

  // قص النص الطويل مع زر عرض المزيد
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const renderSuggestion = (fb: Feedback) => {
    if (!fb.suggestion) return '-';
    if (fb.suggestion.length < 40) return fb.suggestion;
    if (expandedId === fb.id) return <>{fb.suggestion} <button className="text-blue-600 underline text-xs" onClick={() => setExpandedId(null)}>إخفاء</button></>;
    return <>{fb.suggestion.slice(0, 40)}... <button className="text-blue-600 underline text-xs" onClick={() => setExpandedId(fb.id)}>المزيد</button></>;
  };

  return (
    <AuthGuard requireOwner={true}>
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6 gap-2 flex-wrap">
          <h1 className="text-2xl font-bold">إدارة تقييمات العملاء</h1>
          <div className="flex gap-2 flex-wrap">
            <button onClick={handleExport} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-800 transition">
              <Download size={18} /> تصدير إلى Excel
            </button>
            <Link to="/admin/dashboard">
              <button className="flex items-center gap-2 bg-noor-purple text-white px-4 py-2 rounded hover:bg-noor-orange transition">
                <Home size={18} /> لوحة التحكم
              </button>
            </Link>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          <input
            type="text"
            placeholder="بحث باسم العميل أو الاقتراح..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border rounded px-3 py-2 focus:outline-none focus:ring focus:border-noor-purple w-64"
          />
          <select
            value={filterRating ?? ''}
            onChange={e => setFilterRating(e.target.value ? Number(e.target.value) : null)}
            className="border rounded px-3 py-2 focus:outline-none focus:ring focus:border-noor-purple"
          >
            <option value="">كل التقييمات</option>
            <option value="5">5 نجوم</option>
            <option value="4">4 نجوم</option>
            <option value="3">3 نجوم</option>
            <option value="2">2 نجوم</option>
            <option value="1">1 نجمة</option>
          </select>
        </div>
        {loading ? (
          <div>جاري التحميل...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : filteredFeedbacks.length === 0 ? (
          <div>لا توجد تقييمات مطابقة.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded shadow text-sm">
              <thead>
                <tr className="bg-noor-purple text-white">
                  <th className="p-2">اسم العميل</th>
                  <th className="p-2">تقييم الجودة</th>
                  <th className="p-2">تقييم البرنامج</th>
                  <th className="p-2">الاقتراح</th>
                  <th className="p-2">الموقع الجغرافي</th>
                  <th className="p-2">التاريخ</th>
                  <th className="p-2">حذف</th>
                </tr>
              </thead>
              <tbody>
                {filteredFeedbacks.map(fb => (
                  <tr key={fb.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-bold">{fb.customer_name}</td>
                    <td className={`p-2 text-center font-bold ${fb.quality_rating >= 4 ? 'text-green-600' : fb.quality_rating <= 2 ? 'text-red-600' : 'text-yellow-600'}`}>{'★'.repeat(fb.quality_rating)}</td>
                    <td className={`p-2 text-center font-bold ${fb.app_rating >= 4 ? 'text-green-600' : fb.app_rating <= 2 ? 'text-red-600' : 'text-yellow-600'}`}>{'★'.repeat(fb.app_rating)}</td>
                    <td className="p-2">{renderSuggestion(fb)}</td>
                    <td className="p-2 text-center">
                      {fb.latitude && fb.longitude ? (
                        <a
                          href={`https://maps.google.com/?q=${fb.latitude},${fb.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          عرض الموقع
                        </a>
                      ) : (
                        <span className="text-gray-400">غير متوفر</span>
                      )}
                    </td>
                    <td className="p-2 text-xs">{new Date(fb.created_at).toLocaleString('ar-EG')}</td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => handleDelete(fb.id)}
                        disabled={deletingId === fb.id}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-800 transition"
                      >
                        {deletingId === fb.id ? 'جاري الحذف...' : 'حذف'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AuthGuard>
  );
};

export default FeedbacksAdmin; 