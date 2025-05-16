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

const ManageUsers = () => {
    const { users = [], fetchAllUsers, userData } = useContext(AppContext); // Get userData from context
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Only allow admins to fetch users
        if (!userData || userData.publicMetadata?.role !== 'admin') {
            setError('Forbidden: Admins only');
            return;
        }
        const fetchData = async () => {
            try {
                setError(null);
                setLoading(true);
                await fetchAllUsers();
            } catch (err) {
                console.error('Error fetching users:', err);
                setError('Failed to load users. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [fetchAllUsers, userData]);

    useEffect(() => {
        console.log('Loading state:', loading);
        console.log('Users state:', users);
    }, [loading, users]);

    useEffect(() => {
        console.log('Component mounted');
        return () => {
            console.log('Component unmounted');
        };
    }, []); // Log component lifecycle for debugging

    useEffect(() => {
        console.log('Rendering ManageUsers component');
        console.log('Current loading state:', loading);
        console.log('Current users state:', users);
        console.log('Current error state:', error);
    }, [loading, users, error]); // Log state changes during rendering

    const filteredUsers = (users || []).filter(user =>
        (user.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <p>Loading...</p>;

    if (error) return <p className="text-red-500">{error}</p>; // Display error message

    if (!Array.isArray(users) || users.length === 0) {
        return <p className="text-gray-500">No users found. Please try again later.</p>; // Handle empty state gracefully
    }

    return (
        <ErrorBoundary>
            <div className="p-6 bg-gray-100 min-h-screen">
                <h1 className="text-2xl font-bold mb-4">Manage Users</h1>
                <p className="mb-6">This is the Manage Users page. Here you can view, edit, and delete user accounts.</p>
                <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <table className="table-auto w-full bg-white shadow-md rounded-lg">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="px-4 py-2">ID</th>
                            <th className="px-4 py-2">Name</th>
                            <th className="px-4 py-2">Email</th>
                            <th className="px-4 py-2">Role</th>
                            <th className="px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="border-t">
                                <td className="px-4 py-2 text-center">{user.id}</td>
                                <td className="px-4 py-2">{user.name}</td>
                                <td className="px-4 py-2">{user.email}</td>
                                <td className="px-4 py-2">{user.role}</td>
                                <td className="px-4 py-2 flex gap-2 justify-center">
                                    <button 
                                        onClick={() => handleUpdate(user.id, { role: 'admin' })} 
                                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                                        Make Admin
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(user.id)} 
                                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </ErrorBoundary>
    );
};

export default ManageUsers;