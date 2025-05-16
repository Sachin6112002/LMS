import React, { useContext, Component } from 'react';
import { Routes, Route, useMatch } from 'react-router-dom';
import Navbar from './components/student/Navbar';
import Home from './pages/student/Home';
import CourseDetails from './pages/student/CourseDetails';
import CoursesList from './pages/student/CoursesList';
import Dashboard from './pages/educator/Dashboard';
import AddCourse from './pages/educator/AddCourse';
import MyCourses from './pages/educator/MyCourses';
import StudentsEnrolled from './pages/educator/StudentsEnrolled';
import Educator from './pages/educator/Educator';
import 'quill/dist/quill.snow.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import Player from './pages/student/Player';
import MyEnrollments from './pages/student/MyEnrollments';
import Loading from './components/student/Loading';
import Admin from './pages/admin/Admin';
import ManageUsers from './pages/admin/ManageUsers';
import ManageCourses from './pages/admin/ManageCourses'; // Import ManageCourses
import AdminSettings from './pages/admin/AdminSettings';
import AdminDashboard from './pages/admin/AdminDahboard';
import { AppContextProvider } from './context/AppContext';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error and error information to the console
    console.error('Error caught by ErrorBoundary:', error, errorInfo);

    // You can also send the error information to a logging service here

    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h1>Something went wrong.</h1>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Global Error caught:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h1>Something went wrong.</h1>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

const App = () => {
  const isEducatorRoute = useMatch('/educator/*');
  const isAdminRoute = useMatch('/admin/*');

  return (
    <GlobalErrorBoundary>
      <ErrorBoundary>
        <AppContextProvider>
          <div className="text-default min-h-screen bg-white">
            <ToastContainer />
            {/* Render Student Navbar only if not on educator or admin routes */}
            {!(isEducatorRoute || isAdminRoute) && <Navbar />}
            <Routes>
              {/* Student Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/course/:id" element={<CourseDetails />} />
              <Route path="/course-list" element={<CoursesList />} />
              <Route path="/course-list/:input" element={<CoursesList />} />
              <Route path="/my-enrollments" element={<MyEnrollments />} />
              <Route path="/player/:courseId" element={<Player />} />
              <Route path="/loading/:path" element={<Loading />} />

              {/* Educator Routes */}
              <Route path="/educator/*" element={<Educator />} />

              {/* Admin Routes */}
              <Route path="/admin/*" element={<Admin />} />
            </Routes>
          </div>
        </AppContextProvider>
      </ErrorBoundary>
    </GlobalErrorBoundary>
  );
};

export default App;