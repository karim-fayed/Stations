-- إعادة تمكين سياسات أمان الصفوف بعد الاختبار

-- تمكين سياسات أمان الصفوف لجدول المدن
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

-- إضافة تعليق توضيحي
COMMENT ON TABLE cities IS 'جدول المدن مع سياسات أمان الصفوف';
