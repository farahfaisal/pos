import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import ErrorBoundary from './components/ErrorBoundary';
import PrivateRoute from './components/routes/PrivateRoute';
import AdminRoute from './components/routes/AdminRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Customers from './pages/Customers';
import CustomerAccounts from './pages/CustomerAccounts';
import Users from './pages/Users';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ErrorBoundary>
      <div dir="rtl" className="min-h-screen bg-gray-50 text-right">
        <AuthProvider>
          <SettingsProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                <Route path="/" element={<Navigate to="/pos" replace />} />
                
                <Route path="/pos" element={
                  <PrivateRoute>
                    <POS />
                  </PrivateRoute>
                } />
                
                <Route path="/dashboard" element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } />
                
                <Route path="/products" element={
                  <PrivateRoute>
                    <Products />
                  </PrivateRoute>
                } />

                <Route path="/categories" element={
                  <PrivateRoute>
                    <Categories />
                  </PrivateRoute>
                } />
                
                <Route path="/customers" element={
                  <PrivateRoute>
                    <Customers />
                  </PrivateRoute>
                } />
                
                <Route path="/accounts" element={
                  <PrivateRoute>
                    <CustomerAccounts />
                  </PrivateRoute>
                } />
                
                <Route path="/users" element={
                  <AdminRoute>
                    <Users />
                  </AdminRoute>
                } />
                
                <Route path="/reports" element={
                  <PrivateRoute>
                    <Reports />
                  </PrivateRoute>
                } />
                
                <Route path="/settings" element={
                  <PrivateRoute>
                    <Settings />
                  </PrivateRoute>
                } />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
          </SettingsProvider>
        </AuthProvider>
      </div>
    </ErrorBoundary>
  );
}

export default App;