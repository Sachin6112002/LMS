import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchCourses();
  }, []); // Ensure this useEffect runs only once on mount

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/courses');
      setCourses(Array.isArray(response.data) ? response.data : []); // Ensure courses is always an array
    } catch (error) {
      console.error('Failed to fetch courses', error);
      setCourses([]); // Fallback to an empty array on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContext.Provider value={{ users, courses, loading, fetchUsers, fetchCourses }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
