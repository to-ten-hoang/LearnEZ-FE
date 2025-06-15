import Navigation from 'components/common/Navigation/Navigation';
import ProfileCard from 'components/common/ProfileCard/ProfileCard';
import './TeacherProfile.css';

const TeacherProfile = () => {
  return (
    <div className="teacher-profile">
      <Navigation />
      <ProfileCard />
    </div>
  );
};

export default TeacherProfile;