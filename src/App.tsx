import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Login } from './pages/Login';
import { RoundsList } from './pages/RoundsList';
import { RoundPage } from './pages/RoundPage';
import { useAuth } from './hooks/useAuth';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>Загрузка...</div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/rounds"
          element={
            <PrivateRoute>
              <RoundsList />
            </PrivateRoute>
          }
        />
        <Route
          path="/round/:id"
          element={
            <PrivateRoute>
              <RoundPage />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/rounds" />} />
      </Routes>
    </Router>
  );
};

export default App;
