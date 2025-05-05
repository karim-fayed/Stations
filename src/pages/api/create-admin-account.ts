
/**
 * تم تعديل هذا الملف لمنع إنشاء المستخدمين التلقائي
 * يجب إنشاء المستخدمين فقط من خلال واجهة المستخدم أو قاعدة البيانات مباشرة
 */

export async function POST(req: Request) {
  return new Response(
    JSON.stringify({
      success: false,
      error: "تم تعطيل إنشاء المستخدمين التلقائي. يرجى استخدام واجهة المستخدم أو قاعدة البيانات مباشرة."
    }),
    { status: 403, headers: { "Content-Type": "application/json" } }
  );
}

export const runtime = 'edge';
