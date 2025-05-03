
import { useState } from "react";
import PasswordLoginForm from "./PasswordLoginForm";

const LoginTabs = () => {
  const [email, setEmail] = useState('');

  return (
    <div className="w-full">
      <PasswordLoginForm email={email} setEmail={setEmail} />
    </div>
  );
};

export default LoginTabs;
