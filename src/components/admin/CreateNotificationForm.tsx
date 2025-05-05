
import React from 'react';
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

// Define the notification schema
const notificationSchema = z.object({
  title: z.string().min(3, { message: 'العنوان مطلوب ويجب أن يكون 3 أحرف على الأقل' }),
  content: z.string().min(10, { message: 'المحتوى مطلوب ويجب أن يكون 10 أحرف على الأقل' }),
  target_role: z.enum(['all', 'admin', 'owner'], {
    required_error: 'الرجاء تحديد الجمهور المستهدف',
  }),
  image_url: z.string().optional(),
});

// TypeScript interface for the form values
type NotificationFormValues = z.infer<typeof notificationSchema>;

interface CreateNotificationFormProps {
  onSuccess?: () => void;
}

const CreateNotificationForm = ({ onSuccess }: CreateNotificationFormProps) => {
  const { toast } = useToast();
  
  // Initialize form with validation schema
  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: '',
      content: '',
      target_role: 'all',
      image_url: '',
    },
  });

  const onSubmit = async (values: NotificationFormValues) => {
    try {
      // Add timestamp and read status
      const notification = {
        ...values,
        created_at: new Date().toISOString(),
        is_read: false,
      };
      
      // Insert notification to Supabase
      const { error } = await supabase
        .from('notifications')
        .insert(notification);
      
      if (error) throw error;
      
      // Reset form and show success message
      form.reset();
      toast({
        title: 'تم إرسال الإشعار بنجاح',
        description: 'تم إرسال الإشعار إلى المستخدمين المستهدفين',
      });
      
      // Call success callback if provided
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating notification:', error);
      toast({
        variant: 'destructive',
        title: 'حدث خطأ',
        description: 'لم نتمكن من إرسال الإشعار. الرجاء المحاولة مرة أخرى.',
      });
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
        
        <Button type="submit" className="w-full">إرسال الإشعار</Button>
      </form>
    </Form>
  );
};

export default CreateNotificationForm;
