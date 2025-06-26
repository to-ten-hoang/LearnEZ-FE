export const rolePermissions: { [key: string]: string[] } = {
  student: ['profile', 'video-courses', 'offline-classes'],
  teacher: ['profile', 'class-management', 'question-bank'],
  manager: ['profile', 'statistics', 'member-management', 'course-management', 'blog-approval', 'question-bank', 'business'],
  consultant: ['profile', 'write-blog', 'course-management', 'business'],
};