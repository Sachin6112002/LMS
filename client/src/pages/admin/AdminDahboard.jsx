import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { assets, dummyDashboardData } from '../../assets/assets';
import Loading from '../../components/student/Loading';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { currency } = useContext(AppContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [metrics, setMetrics] = useState({
    totalUsers: 120,
    totalCourses: 45,
    totalEarnings: 15000,
  });
  const recentActivities = [
    { id: 1, activity: 'User John Doe enrolled in JavaScript Basics', timestamp: '2025-05-12 10:00 AM' },
    { id: 2, activity: 'Course Advanced Python Programming was updated', timestamp: '2025-05-11 03:45 PM' },
    { id: 3, activity: 'Admin Jane Smith added a new course', timestamp: '2025-05-10 01:30 PM' },
  ];
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    setDashboardData(dummyDashboardData);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
  };

  return dashboardData ? (
    <div className='min-h-screen flex flex-col items-start justify-between gap-8 md:p-8 md:pb-0 p-4 pt-8 pb-0'>
      <div className='space-y-5'>
        <div className='flex flex-wrap gap-5 items-center'>
          <div className='flex items-center gap-3 shadow-card border border-blue-500 p-4 w-56 rounded-md'>
            <img src={assets.patients_icon} alt='patients_icon' />
            <div>
              <p className='text-2xl font-medium text-gray-600'>
                {dashboardData.enrolledStudentsData.length}
              </p>
              <p className='text-base text-gray-500'>Total Enrolments</p>
            </div>
          </div>
          <div className='flex items-center gap-3 shadow-card border border-blue-500 p-4 w-56 rounded-md'>
            <img src={assets.appointments_icon} alt='appointments_icon' />
            <div>
              <p className='text-2xl font-medium text-gray-600'>
                {dashboardData.totalCourses}
              </p>
              <p className='text-base text-gray-500'>Total Courses</p>
            </div>
          </div>
          <div className='flex items-center gap-3 shadow-card border border-blue-500 p-4 w-56 rounded-md'>
            <img src={assets.earning_icon} alt='earning_icon' />
            <div>
              <p className='text-2xl font-medium text-gray-600'>
                {currency}
                {dashboardData.totalEarnings}
              </p>
              <p className='text-base text-gray-500'>Total Earnings</p>
            </div>
          </div>
        </div>
        <div>
          <h2 className='pb-4 text-lg font-medium'>Latest Enrollments</h2>
          <div className='flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20'>
            <table className='table-fixed md:table-auto w-full overflow-hidden'>
              <thead className='text-gray-900 border-b border-gray-500/20 text-sm text-left'>
                <tr>
                  <th className='px-4 py-3 font-semibold text-center hidden sm:table-cell'>#</th>
                  <th className='px-4 py-3 font-semibold'>Student Name</th>
                  <th className='px-4 py-3 font-semibold'>Course Title</th>
                  <th className='px-4 py-3 font-semibold'>Enrollment Date</th>
                  <th className='px-4 py-3 font-semibold'>Status</th>
                </tr>
              </thead>
              <tbody className='text-sm text-gray-500'>
                {dashboardData.enrolledStudentsData.map((item, index) => (
                  <tr key={index} className='border-b border-gray-500/20'>
                    <td className='px-4 py-3 text-center hidden sm:table-cell'>{index + 1}</td>
                    <td className='md:px-4 px-2 py-3 flex items-center space-x-3'>
                      <img
                        src={item.student.imageUrl}
                        alt='Profile'
                        className='w-9 h-9 rounded-full'
                      />
                      <span className='truncate'>{item.student.name}</span>
                    </td>
                    <td className='px-4 py-3 truncate'>{item.courseTitle}</td>
                    <td className='px-4 py-3 truncate'>{item.enrollmentDate}</td>
                    <td className='px-4 py-3 truncate'>{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className='bg-white shadow-md rounded-lg p-4'>
          <h2 className='text-lg font-medium mb-4'>Recent Activities</h2>
          <ul>
            {recentActivities.map(activity => (
              <li key={activity.id} className='border-b py-2'>
                <p>{activity.activity}</p>
                <p className='text-sm text-gray-500'>{activity.timestamp}</p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <button onClick={() => handleNavigation('/admin/settings')}>Settings</button>
          <button onClick={() => handleNavigation('/admin/manage-courses')}>Manage Courses</button>
          <button onClick={() => handleNavigation('/admin/manage-users')}>Manage Users</button>
        </div>
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default AdminDashboard;