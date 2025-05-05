
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

// تعريف نموذج الإشعار
const notificationSchema = z.object({
  title: z.string().min(3, { message: 'العنوان مطلوب ويجب أن يكون 3 أحرف على الأقل' }),
  content: z.string().min(10, { message: 'المحتوى مطلوب ويجب أن يكون 10 أحرف على الأقل' }),
  target_role: z.enum(['all', 'admin', 'owner'], {
    required_error: 'الرجاء تحديد الجمهور المستهدف',
  }),
  image_url: z.string().optional(),
  play_sound: z.boolean().default(true),
});

// واجهة نموذج الإشعار
type NotificationFormValues = z.infer<typeof notificationSchema>;

interface CreateNotificationFormProps {
  onSuccess?: () => void;
}

const CreateNotificationForm = ({ onSuccess }: CreateNotificationFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // تهيئة النموذج مع مخطط التحقق
  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: '',
      content: '',
      target_role: 'all',
      image_url: '',
      play_sound: true,
    },
  });

  const onSubmit = async (values: NotificationFormValues) => {
    try {
      setIsSubmitting(true);

      // إضافة الطابع الزمني وحالة القراءة - التأكد من وجود جميع الحقول المطلوبة
      const currentTime = new Date().toISOString();
      const notification = {
        title: values.title,
        content: values.content,
        target_role: values.target_role,
        image_url: values.image_url || null,
        play_sound: values.play_sound,
        created_at: currentTime,
        updated_at: currentTime,
        is_read: false,
      };

      // إدخال الإشعار إلى Supabase
      const { error, data } = await supabase
        .from('notifications')
        .insert(notification)
        .select();

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }

      console.log('Notification created successfully:', data);

      // إعادة تعيين النموذج وعرض رسالة نجاح
      form.reset();
      toast({
        title: 'تم إرسال الإشعار بنجاح',
        description: 'تم إرسال الإشعار إلى المستخدمين المستهدفين',
      });

      // استدعاء دالة نجاح إذا تم توفيرها
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating notification:', error);
      toast({
        variant: 'destructive',
        title: 'حدث خطأ',
        description: 'لم نتمكن من إرسال الإشعار. الرجاء المحاولة مرة أخرى.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>عنوان الإشعار</FormLabel>
              <FormControl>
                <Input placeholder="أدخل عنوان الإشعار" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>محتوى الإشعار</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="أدخل محتوى الإشعار هنا..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="target_role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>إرسال إلى</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="حدد الجمهور المستهدف" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="all">جميع المستخدمين</SelectItem>
                  <SelectItem value="admin">المشرفين فقط</SelectItem>
                  <SelectItem value="owner">المالكين فقط</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>رابط الصورة (اختياري)</FormLabel>
              <FormControl>
                <Input placeholder="أدخل رابط الصورة (اختياري)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="play_sound"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rtl:space-x-reverse">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                />
              </FormControl>
              <FormLabel className="mr-2">تشغيل صوت تنبيه مع الإشعار</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-noor-purple to-noor-orange"
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          إرسال الإشعار
        </Button>
      </form>
    </Form>
  );
};

export default CreateNotificationForm;
