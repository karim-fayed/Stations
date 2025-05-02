
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PasswordLoginForm from "./PasswordLoginForm";
import MagicLinkForm from "./MagicLinkForm";

const LoginTabs = () => {
  const [email, setEmail] = useState('');
  const [activeTab, setActiveTab] = useState("password");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <Tabs defaultValue="password" value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="password">تسجيل الدخول بكلمة المرور</TabsTrigger>
        <TabsTrigger value="magic">تسجيل الدخول برابط</TabsTrigger>
      </TabsList>
      <TabsContent value="password">
        <PasswordLoginForm email={email} setEmail={setEmail} />
      </TabsContent>
      <TabsContent value="magic">
        <MagicLinkForm email={email} setEmail={setEmail} />
      </TabsContent>
    </Tabs>
  );
};

export default LoginTabs;
