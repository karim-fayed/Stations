
import { createTestAdmin } from "./createTestAdmin";

/**
 * يجب استدعاء هذه الوظيفة مرة واحدة أثناء تهيئة التطبيق
 * للتأكد من وجود مستخدم مشرف
 */
export async function ensureAdminExists() {
  try {
    // تشغيل هذا في وضع التطوير فقط
    if (process.env.NODE_ENV !== "production") {
      await createTestAdmin();
    }
  } catch (error) {
    console.error("خطأ في ensureAdminExists:", error);
  }
}

export * from "./createAdminUser";
export * from "./createTestAdmin";
export * from "./types";
