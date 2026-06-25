import { useAuth } from '../../context/AuthContext';
import AdminDashboard  from './AdminDashboard';
import DoctorDashboard from './DoctorDashboard';
import PatientDashboard from './PatientDashboard';

const OverviewDashboard = () => {
  const { user } = useAuth();
  switch (user?.role) {
    case 'admin':  return <AdminDashboard />;
    case 'doctor': return <DoctorDashboard />;
    default:       return <PatientDashboard />;
  }
};

export default OverviewDashboard;
