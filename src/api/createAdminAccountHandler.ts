/**
 * تم إزالة وظيفة createAdminAccountHandler التي كانت تنشئ مستخدمين تلقائيًا
 * يجب إنشاء المستخدمين فقط من خلال واجهة المستخدم أو قاعدة البيانات مباشرة
 *
 * هذه الوظيفة الوهمية موجودة فقط لتجنب أخطاء الاستيراد في الأماكن التي قد تستخدمها
 */
export async function createAdminAccountHandler(
  email: string,
  password: string,
  name: string
) {
  console.warn("تم تعطيل إنشاء المستخدمين التلقائي");
  return {
    success: false,
    error: "تم تعطيل إنشاء المستخدمين التلقائي. يرجى استخدام واجهة المستخدم أو قاعدة البيانات مباشرة."
  };
}
