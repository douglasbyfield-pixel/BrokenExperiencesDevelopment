import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';

// Pages
import Home from './pages/Home';
import Map from './pages/Map';
import Report from './pages/Report';
import Profile from './pages/Profile';
import Login from './pages/Login';

// Components
import BottomNav from './components/BottomNav';

// Services
import { AuthProvider, useAuth } from './services/AuthContext';

const AppContainer = styled.div`
  min-height: 100vh;
  background: #ffffff;
  font-family: 'Poppins', sans-serif;
`;

const ContentWrapper = styled.div`
  padding-bottom: 80px; /* Space for bottom navigation */
  min-height: 100vh;
`;

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/" />;
};

function AppRoutes() {
  return (
    <AppContainer>
      <ContentWrapper>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/map" element={
            <ProtectedRoute>
              <Map />
            </ProtectedRoute>
          } />
          <Route path="/report" element={
            <ProtectedRoute>
              <Report />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
        </Routes>
      </ContentWrapper>
      <BottomNav />
    </AppContainer>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;