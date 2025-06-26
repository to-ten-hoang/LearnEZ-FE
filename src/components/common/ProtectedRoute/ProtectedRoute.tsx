import { message } from "antd";
import { rolePermissions } from "../../../constants/permissions";
import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "store/authStore";
import'./ProtectedRoute.css'
import 'antd/dist/reset.css'

interface ProtectedRouteProps{
  allowedTab: string;
}

const ProtectedRoute = ({allowedTab} : ProtectedRouteProps) => {
  const {user, isAuthenticated} = useAuthStore();
  
  if(!isAuthenticated) {
    message.error('Đăng nhập đã brooo!');
    return <Navigate to="/" replace/>;
  }

  const userRole = user?.role || ' ';
  const hasPermission = rolePermissions[userRole].includes(allowedTab);
  
  if(!hasPermission){
    message.error('Quyền là gì mà là quyền ai chấm');
    console.log('hahaha');
    
    // return <Navigate to="/" replace/>;
  }

  return (
    // <div className="protected-route">
      <Outlet/>
    // </div>
  )
}



export default ProtectedRoute