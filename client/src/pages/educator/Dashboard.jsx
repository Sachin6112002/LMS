import React, { useContext, useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loading from '../../components/student/Loading';

const Dashboard = () => {

  const { backendUrl, isEducator, currency, getToken } = useContext(AppContext)

  const [dashboardData, setDashboardData] = useState(null)

  const fetchDashboardData = async () => {
    try {

      const token = await getToken()

      const { data } = await axios.get(backendUrl + '/api/educator/dashboard',
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        setDashboardData(data.dashboardData)
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {

    if (isEducator) {
      fetchDashboardData()
    }

  }, [isEducator])

  // Use real data from dashboardData instead of dummy data
  const studentsData = dashboardData?.enrolledStudents || [];

  return dashboardData ? (
    <div className='min-h-screen flex flex-col items-start justify-between gap-8 md:p-8 md:pb-0 p-4 pt-8 pb-0 bg-green-50'>
      <div className='space-y-5'>
        <div className='flex flex-wrap gap-5 items-center'>
          <div className='flex items-center gap-3 shadow-card border border-green-500 p-4 w-56 rounded-md bg-white'>
            <img src={assets.patients_icon} alt="patients_icon" />
            <div>
              <p className='text-2xl font-medium text-green-900'>{dashboardData.enrolledStudentsData.length}</p>
              <p className='text-base text-green-700'>Total Enrolments</p>
            </div>
          </div>
          <div className='flex items-center gap-3 shadow-card border border-green-500 p-4 w-56 rounded-md bg-white'>
            <img src={assets.appointments_icon} alt="patients_icon" />
            <div>
              <p className='text-2xl font-medium text-green-900'>{dashboardData.totalCourses}</p>
              <p className='text-base text-green-700'>Total Courses</p>
            </div>
          </div>
          <div className='flex items-center gap-3 shadow-card border border-green-500 p-4 w-56 rounded-md bg-white'>
            <img src={assets.earning_icon} alt="patients_icon" />
            <div>
              <p className='text-2xl font-medium text-green-900'>{currency}{Math.floor(dashboardData.totalEarnings)}</p>
              <p className='text-base text-green-700'>Total Earnings</p>
            </div>
          </div>
        </div>
        <div>
          <h2 className="pb-4 text-lg font-medium text-green-900">Latest Enrolments</h2>
          <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-green-200">
            <table className="table-fixed md:table-auto w-full overflow-hidden">
              <thead className="text-green-900 border-b border-green-200 text-sm text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold text-center hidden sm:table-cell">#</th>
                  <th className="px-4 py-3 font-semibold">Student Name</th>
                  <th className="px-4 py-3 font-semibold">Course Title</th>
                </tr>
              </thead>
              <tbody className="text-sm text-green-700">
                {dashboardData.enrolledStudentsData.map((item, index) => (
                  <tr key={index} className="border-b border-green-200">
                    <td className="px-4 py-3 text-center hidden sm:table-cell">{index + 1}</td>
                    <td className="md:px-4 px-2 py-3 flex items-center space-x-3">
                      <img
                        src={item.student.imageUrl}
                        alt="Profile"
                        className="w-9 h-9 rounded-full"
                      />
                      <span className="truncate">{item.student.name}</span>
                    </td>
                    <td className="px-4 py-3 truncate">{item.courseTitle}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  ) : <Loading />
}

export default Dashboard