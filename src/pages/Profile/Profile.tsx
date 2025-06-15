import useAuthStore from 'store/authStore';
import './Profile.css';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import StudentProfile from 'components/student/StudentProfile/StudentProfile';
import TeacherProfile from 'components/teacher/TeacherProfile/TeacherProfile';

const Profile = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role) {
      navigate('/profile');
    }
  }, [user?.role, navigate]);
  if (!user?.role) return null;

  return (
    <>
      {user?.role === 'teacher' ? <TeacherProfile /> : <StudentProfile />}
    </>
  );
};

export default Profile;