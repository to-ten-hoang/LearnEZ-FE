import { Badge } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import './Notification.css';

const Notification = () => {
  return (
    <div>
      <Badge count={5}>
        <BellOutlined className="notification-icon" />
      </Badge>
    </div>
  );
};

export default Notification;