import React, { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Home from "../pages/Home/Home";

import "../styles/AppRoutes.css";

// Lazy load pages for code splitting
const About = lazy(() => import("../pages/About/About"));
const Dashboard = lazy(() => import("../pages/Dashboard/Dashboard"));
const Settings = lazy(() => import("../pages/Settings/Settings"));
const Login = lazy(() => import("../pages/Login/Login"));
const Register = lazy(() => import("../pages/Register/Register"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="page-section" style={{ textAlign: "center", padding: "2rem" }}>
    <p>Loading...</p>
  </div>
);

// Simple auth check
const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

// Public Route wrapper (login/register only when NOT logged in)
const PublicRoute = ({ children }) => {
  return !isAuthenticated() ? children : <Navigate to="/" replace />;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <div className="page">
        <Navbar />

        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Default route */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />

            {/* Protected pages */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/about"
              element={
                <ProtectedRoute>
                  <About />
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* Public pages (only when NOT logged in) */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />

            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* fallback */}
            <Route path="*" element={<Navigate to="/" />} />
            
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  );
};

export default AppRoutes;
