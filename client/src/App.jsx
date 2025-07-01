import React, { useContext, Component, Suspense } from "react";
import { Routes, Route, useMatch } from "react-router-dom";
import Navbar from "./components/student/Navbar";
import Home from "./pages/student/Home";
import CourseDetails from "./pages/student/CourseDetails";
import CoursesList from "./pages/student/CoursesList";
import Educator from "./pages/educator/Educator";
import "quill/dist/quill.snow.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import Player from "./pages/student/Player";
import MyEnrollments from "./pages/student/MyEnrollments";
import Loading from "./components/student/Loading";
import { AppContextProvider } from "./context/AppContext";
import Register from "./pages/student/Register";
import Dashboard from "./pages/educator/Dashboard";
import AddCourse from "./pages/educator/AddCourse";
import EditCourse from "./pages/educator/EditCourse";
import MyCourses from "./pages/educator/MyCourses";
import StudentsEnrolled from "./pages/educator/StudentsEnrolled";
import Login from "./pages/student/Login";
import About from "./pages/student/About";
import Contact from "./pages/student/Contact";
import Privacy from "./pages/student/Privacy";
import Testimonials from "./pages/student/Testimonials";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOtp from "./pages/VerifyOtp";
import PaymentResult from "./pages/student/PaymentResult";
import AdminManageCourses from "./pages/AdminManageCourses";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also send the error information to a logging service here
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h1>Something went wrong.</h1>
          <details style={{ whiteSpace: "pre-wrap" }}>
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
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h1>Something went wrong.</h1>
          <details style={{ whiteSpace: "pre-wrap" }}>
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
  const isEducatorRoute = useMatch("/educator/*");
  const isAdminRoute = useMatch("/admin/*");

  return (
    <GlobalErrorBoundary>
      <ErrorBoundary>
        <AppContextProvider>
          <div className="text-default min-h-screen bg-white">
            <ToastContainer />
            {/* Render Student Navbar only if not on educator or admin routes */}
            {!(isEducatorRoute || isAdminRoute) && <Navbar />}
            <Suspense fallback={<Loading />}>
              <Routes>
                {/* Student Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/course/:id" element={<CourseDetails />} />
                <Route path="/course-list" element={<CoursesList />} />
                <Route path="/course-list/:input" element={<CoursesList />} />
                <Route path="/my-enrollments" element={<MyEnrollments />} />
                <Route path="/player/:courseId" element={<Player />} />
                <Route path="/loading/:redirectTo" element={<PaymentResult />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/testimonials" element={<Testimonials />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-otp" element={<VerifyOtp />} />

                {/* Educator Routes */}
                <Route path="/educator/*" element={<Educator />}>
                  <Route index element={<Dashboard />} />
                  <Route path="add-course" element={<AddCourse />} />
                  <Route path="edit-course/:courseId" element={<EditCourse />} />
                  <Route path="my-courses" element={<MyCourses />} />
                  <Route path="student-enrolled" element={<StudentsEnrolled />} />
                </Route>

                {/* Admin Routes */}
                <Route path="/admin/manage-courses" element={<AdminManageCourses />} />
              </Routes>
            </Suspense>
          </div>
        </AppContextProvider>
      </ErrorBoundary>
    </GlobalErrorBoundary>
  );
};

export default App;