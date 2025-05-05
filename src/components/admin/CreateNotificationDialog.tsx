
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import CreateNotificationForm from './CreateNotificationForm';

interface CreateNotificationDialogProps {
  triggerClassName?: string;
  onNotificationCreated?: () => void;
}

const CreateNotificationDialog = ({ 
  triggerClassName,
  onNotificationCreated 
}: CreateNotificationDialogProps) => {
  const [open, setOpen] = React.useState(false);

  const handleSuccess = () => {
    setOpen(false);
    if (onNotificationCreated) {
      onNotificationCreated();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="secondary" 
          className={triggerClassName}
        >
          <Bell className="mr-2" size={18} />
          إرسال إشعار جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>إنشاء إشعار جديد</DialogTitle>
          <DialogDescription>
            أنشئ إشعارًا جديدًا ليتم إرساله للمستخدمين.
          </DialogDescription>
        </DialogHeader>
        <CreateNotificationForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
};

export default CreateNotificationDialog;
