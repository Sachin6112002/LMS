import React, { useContext, Component } from "react";
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
import MyCourses from "./pages/educator/MyCourses";
import StudentsEnrolled from "./pages/educator/StudentsEnrolled";
import Login from "./pages/student/Login";
import About from "./pages/student/About";
import Contact from "./pages/student/Contact";
import Privacy from "./pages/student/Privacy";
import Testimonials from "./pages/student/Testimonials";

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
    console.error("Error caught by ErrorBoundary:", error, errorInfo);

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
    console.error("Global Error caught:", error, errorInfo);
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
            <Routes>
              {/* Student Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/course/:id" element={<CourseDetails />} />
              <Route path="/course-list" element={<CoursesList />} />
              <Route path="/course-list/:input" element={<CoursesList />} />
              <Route path="/my-enrollments" element={<MyEnrollments />} />
              <Route path="/player/:courseId" element={<Player />} />
              <Route path="/loading/:path" element={<Loading />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/testimonials" element={<Testimonials />} />

              {/* Educator Routes */}
              <Route path="/educator/*" element={<Educator />}>
                <Route index element={<Dashboard />} />
                <Route path="add-course" element={<AddCourse />} />
                <Route path="my-courses" element={<MyCourses />} />
                <Route path="student-enrolled" element={<StudentsEnrolled />} />
              </Route>

              {/* Admin Routes */}
              {/* <Route path="/admin/*" element={<Admin />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="manage-users" element={<ManageUsers />} />
                <Route path="manage-courses" element={<ManageCourses />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route index element={<AdminDashboard />} />
              </Route> */}
            </Routes>
          </div>
        </AppContextProvider>
      </ErrorBoundary>
    </GlobalErrorBoundary>
  );
};

export default App;