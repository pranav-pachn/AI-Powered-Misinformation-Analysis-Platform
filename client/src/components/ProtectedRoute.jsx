import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import Loader from './Loader';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useUser();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
