
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from './pages/Index';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import AdminLogin from './pages/Admin/Login';
import AdminDashboard from './pages/Admin/Dashboard';
import { LanguageProvider } from './i18n/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;
