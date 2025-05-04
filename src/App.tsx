
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Index from './pages/Index';
import About from './pages/About';
import Contact from './pages/Contact';
import Services from './pages/Services';
import NotFound from './pages/NotFound';
import Login from './pages/Admin/Login';
import Dashboard from './pages/Admin/Dashboard';
import Profile from './pages/Admin/Profile';
import UserManagement from './pages/Admin/UserManagement';
import { Toaster } from "@/components/ui/toaster";
import AuthGuard from './components/AuthGuard';
import LoadingSpinner from './components/LoadingSpinner';
import { DatabaseMaintenance } from './pages/Admin';

function App() {
  return (
    <Router>
      <div className="App">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/services" element={<Services />} />
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin" element={<AuthGuard><Dashboard /></AuthGuard>} />
            <Route path="/admin/profile" element={<AuthGuard><Profile /></AuthGuard>} />
            <Route path="/admin/users" element={<AuthGuard><UserManagement /></AuthGuard>} />
            {/* Add the new route for Database Maintenance */}
            <Route path="/admin/db-maintenance" element={<AuthGuard><DatabaseMaintenance /></AuthGuard>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
