// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/auth.context';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import ImageUpload from './components/ImageUpload';
import ImageList from './components/ImageList';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100 py-6 px-4">
          <div className="container mx-auto">
            <Routes>
              <Route path="/" element={<PrivateRoute />}>
                <Route path="/images" element={<ImageList />} />
                <Route path="/upload" element={<ImageUpload />} />
              </Route>
              <Route path="/sign-up" element={<SignUp />} />
              <Route path="/sign-in" element={<SignInRoute />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
};

const PrivateRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/sign-in" />;
};

const SignInRoute = () => {
  const { isAuthenticated, signIn } = useAuth();
  return isAuthenticated ? <Navigate to="/upload" /> : <SignIn onSignIn={signIn} />;
};

export default App;
