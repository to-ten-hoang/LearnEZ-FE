import ProfileForm from '../../components/common/ProfileForm/ProfileForm';
import './Profile.css';

const Profile = () => {
  return (
    <div className="profile-page">
      <h1>Thông tin cá nhân</h1>
      <ProfileForm />
    </div>
  );
};

export default Profile;