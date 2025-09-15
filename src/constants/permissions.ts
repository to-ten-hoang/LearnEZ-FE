// constants/permissions.ts - Updated with Cart & Order Permissions

/**
 * ✅ ROLE PERMISSIONS
 * 
 * Định nghĩa các tabs/pages mà mỗi role được access
 */
export const rolePermissions: { [key: string]: string[] } = {
  student: [
    'profile',           // Thông tin cá nhân
    'video-courses',     // Khóa học video đã mua
    'offline-classes',   // Lớp học offline
    'cart',              // ✅ NEW: Quản lý giỏ hàng
    'orders',            // ✅ NEW: Lịch sử đơn hàng
    'courses'  
    
  ],
  teacher: [
    'profile', 
    'class-management', 
    'question-bank'
  ],
  manager: [
    'profile', 
    'statistics', 
    'member-management', 
    'course-management', 
    'blog-approval', 
    'question-bank', 
    'business',
    'order-management'   // ✅ NEW: Quản lý đơn hàng (admin view)
  ],
  consultant: [
    'profile', 
    'write-blog', 
    'course-management', 
    'business'
  ],
};

/**
 * ✅ NAVIGATION PERMISSIONS
 * 
 * Định nghĩa menu items nào hiển thị cho role nào
 */
export const navigationPermissions = {
  // ============= MAIN NAVIGATION (Header Menu) =============
  courses: ['student', 'teacher', 'manager', 'consultant'],
  blog: ['student', 'teacher', 'manager', 'consultant'],
  test: ['student', 'teacher', 'manager', 'consultant'],
  
  // ============= DASHBOARD NAVIGATION (Sidebar Menu) =============
  profile: ['student', 'teacher', 'manager', 'consultant'],
  
  // Student specific
  'video-courses': ['student'],
  'offline-classes': ['student'],
  'cart': ['student'],                    // ✅ NEW: Giỏ hàng
  'orders': ['student'],                  // ✅ NEW: Đơn hàng của student
  
  // Teacher specific  
  'class-management': ['teacher'],
  
  // Shared between teacher & manager
  'question-bank': ['teacher', 'manager'],
  
  // Manager specific
  'statistics': ['manager'],
  'blog-approval': ['manager'],
  'order-management': ['manager'],        // ✅ NEW: Quản lý đơn hàng (admin)
  
  // Shared between manager & consultant
  'course-management': ['manager', 'consultant'],
  'business': ['manager', 'consultant'],
  
  // Manager & Student (special case)
  'member-management': ['manager', 'student'],
  
  // Consultant specific
  'write-blog': ['consultant'],
} as const;

/**
 * ✅ HELPER FUNCTIONS
 */

// Check xem user có permission cho tab này không
export const hasPermission = (userRole: string, tabName: string): boolean => {
  return rolePermissions[userRole]?.includes(tabName) || false;
};

// Check xem tab có hiển thị trong navigation không
export const showInNavigation = (userRole: string, tabName: string): boolean => {
  const allowedRoles = navigationPermissions[tabName as keyof typeof navigationPermissions] as readonly string[] | undefined;
  return allowedRoles?.includes(userRole) || false;
};

// Get tất cả tabs được phép cho 1 role
export const getAllowedTabs = (userRole: string): string[] => {
  return rolePermissions[userRole] || [];
};