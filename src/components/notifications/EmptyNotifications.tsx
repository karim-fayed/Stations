
import React from 'react';
import { Bell } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

const EmptyNotifications: React.FC = () => {
  return (
    <Card className="w-full">
      <CardContent className="pt-6 flex flex-col items-center justify-center text-center p-8">
        <Bell className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="font-medium text-lg mb-1">لا توجد إشعارات</h3>
        <p className="text-muted-foreground">سيظهر هنا أي إشعار جديد يُرسل لك</p>
      </CardContent>
    </Card>
  );
};

export default EmptyNotifications;
