import React, { Component, useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught in ErrorBoundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <p className="text-red-500">Something went wrong. Please try again later.</p>;
        }

        return this.props.children;
    }
}

const ManageCourses = () => {
    const { courses = [], fetchCourses, loading } = useContext(AppContext); // Default courses to empty array
    const [searchQuery, setSearchQuery] = useState('');
    const [editingCourse, setEditingCourse] = useState(null);
    const [selectedCourses, setSelectedCourses] = useState([]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const handleDelete = (courseId) => {
        setCourses(courses.filter(course => course.id !== courseId));
    };

    const handleEdit = (course) => {
        setEditingCourse(course);
    };

    const handleSave = () => {
        setCourses(courses.map(course =>
            course.id === editingCourse.id ? editingCourse : course
        ));
        setEditingCourse(null);
    };

    const handleToggleStatus = (courseId) => {
        setCourses(courses.map(course =>
            course.id === courseId ? { ...course, status: course.status === 'Published' ? 'Unpublished' : 'Published' } : course
        ));
    };

    const handleBulkDelete = () => {
        setCourses(courses.filter(course => !selectedCourses.includes(course.id)));
        setSelectedCourses([]);
    };

    const handleSelectCourse = (courseId) => {
        setSelectedCourses(prev =>
            prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
        );
    };

    const filteredCourses = (courses || []).filter(course =>
        (course.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.instructor || '').toLowerCase().includes(searchQuery.toLowerCase())
    ); // Defensive: handle undefined/null fields

    // Defensive: show loading if courses is not loaded
    if (loading) return <p>Loading...</p>;
    if (!Array.isArray(courses)) return <p>No courses found.</p>;
    if (courses.length === 0) return <p className="p-8 text-gray-500">No courses available.</p>;

    return (
        <ErrorBoundary>
            <div className="p-6 bg-gray-100 min-h-screen">
                <h1 className="text-2xl font-bold mb-4">Manage Courses</h1>
                <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={handleBulkDelete}
                    disabled={selectedCourses.length === 0}
                    className="mb-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
                >
                    Delete Selected
                </button>
                <table className="table-auto w-full bg-white shadow-md rounded-lg">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="px-4 py-2">
                                <input
                                    type="checkbox"
                                    onChange={(e) => setSelectedCourses(e.target.checked ? courses.map(course => course.id) : [])}
                                    checked={selectedCourses.length === courses.length}
                                />
                            </th>
                            <th className="px-4 py-2">ID</th>
                            <th className="px-4 py-2">Title</th>
                            <th className="px-4 py-2">Instructor</th>
                            <th className="px-4 py-2">Price</th>
                            <th className="px-4 py-2">Status</th>
                            <th className="px-4 py-2">Rating</th>
                            <th className="px-4 py-2">Created At</th>
                            <th className="px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCourses.map(course => (
                            course && course.id ? (
                                <tr key={course.id} className="border-t">
                                    <td className="px-4 py-2 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedCourses.includes(course.id)}
                                            onChange={() => handleSelectCourse(course.id)}
                                        />
                                    </td>
                                    <td className="px-4 py-2 text-center">{course.id}</td>
                                    <td className="px-4 py-2">{course.title}</td>
                                    <td className="px-4 py-2">{course.instructor}</td>
                                    <td className="px-4 py-2 text-center">${course.price}</td>
                                    <td className="px-4 py-2 text-center">
                                        <button
                                            onClick={() => handleToggleStatus(course.id)}
                                            className={`px-2 py-1 rounded ${course.status === 'Published' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}
                                        >
                                            {course.status}
                                        </button>
                                    </td>
                                    <td className="px-4 py-2 text-center">{course.rating}</td>
                                    <td className="px-4 py-2 text-center">{course.createdAt}</td>
                                    <td className="px-4 py-2 flex gap-2 justify-center">
                                        <button
                                            onClick={() => handleEdit(course)}
                                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(course.id)}
                                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ) : null
                        ))}
                    </tbody>
                </table>

                {editingCourse && (
                    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                            <h2 className="text-xl font-bold mb-4">Edit Course</h2>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-medium mb-2">Title</label>
                                <input
                                    type="text"
                                    value={editingCourse.title}
                                    onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-medium mb-2">Instructor</label>
                                <input
                                    type="text"
                                    value={editingCourse.instructor}
                                    onChange={(e) => setEditingCourse({ ...editingCourse, instructor: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-medium mb-2">Price</label>
                                <input
                                    type="number"
                                    value={editingCourse.price}
                                    onChange={(e) => setEditingCourse({ ...editingCourse, price: parseFloat(e.target.value) })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => setEditingCourse(null)}
                                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ErrorBoundary>
    );
};

export default ManageCourses;