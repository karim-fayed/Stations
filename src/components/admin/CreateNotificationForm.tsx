
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNotifications } from '@/contexts/NotificationContext';

interface NotificationFormData {
  title: string;
  content: string;
  target_role: string | null;
  image_url?: string;
}

const CreateNotificationForm: React.FC = () => {
  const { addNotification } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<NotificationFormData>({
    defaultValues: {
      title: '',
      content: '',
      target_role: null,
      image_url: '',
    }
  });

  const onSubmit = async (data: NotificationFormData) => {
    setIsLoading(true);
    try {
      await addNotification({
        title: data.title,
        content: data.content,
        target_role: data.target_role,
        image_url: data.image_url && data.image_url.trim() !== '' ? data.image_url : undefined
      });
      
      toast({
        title: "الإشعار تم إنشاؤه بنجاح",
        description: "تم إرسال الإشعار إلى المستخدمين المستهدفين",
      });
      
      reset();
    } catch (error) {
      console.error('Error creating notification:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء الإشعار",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">عنوان الإشعار</Label>
        <Input
          id="title"
          placeholder="أدخل عنوان الإشعار"
          {...register('title', { required: "العنوان مطلوب" })}
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">محتوى الإشعار</Label>
        <Textarea
          id="content"
          placeholder="أدخل محتوى الإشعار"
          rows={5}
          {...register('content', { required: "المحتوى مطلوب" })}
        />
        {errors.content && (
          <p className="text-sm text-red-500">{errors.content.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="target_role">الفئة المستهدفة</Label>
        <Select
          onValueChange={(value) => {
            const formValue = value === "null" ? null : value;
            reset({ ...register().getValues(), target_role: formValue });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="اختر الفئة المستهدفة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="null">الجميع</SelectItem>
            <SelectItem value="admin">المدراء</SelectItem>
            <SelectItem value="owner">المالكون</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image_url">رابط الصورة (اختياري)</Label>
        <Input
          id="image_url"
          placeholder="https://example.com/image.jpg"
          {...register('image_url')}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "جاري الإرسال..." : "إنشاء إشعار"}
      </Button>
    </form>
  );
};

export default CreateNotificationForm;
