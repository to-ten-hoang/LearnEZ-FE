import {Badge} from 'antd'
import {BellOutlined} from '@ant-design/icons'
import './NotificationIcon.css'

const NotificationIcon
 = () => {
  return (
    <div>
        <Badge count={5}>
            <BellOutlined className="notification-icon" />
        </Badge>
    </div>
  )
}



export default NotificationIcon