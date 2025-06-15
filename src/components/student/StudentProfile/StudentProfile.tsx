import Navigation from 'components/common/Navigation/Navigation';
import ProfileCard from 'components/common/ProfileCard/ProfileCard';
import './StudentProfile.css';

const StudentProfile = () => {
  return (
    <div className="student-profile">
      <Navigation />
      <ProfileCard />
    </div>
  );
};

export default StudentProfile;