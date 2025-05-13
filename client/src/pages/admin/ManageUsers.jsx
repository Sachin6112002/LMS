import React, { useState } from 'react';

const ManageUsers = () => {
    const [users, setUsers] = useState([
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'admin' },
        { id: 3, name: 'Alice Johnson', email: 'alice@example.com', role: 'user' },
    ]);
    const [searchQuery, setSearchQuery] = useState('');

    const handleDelete = (userId) => {
        setUsers(users.filter(user => user.id !== userId));
    };

    const handleUpdate = (userId, updatedData) => {
        setUsers(users.map(user => user.id === userId ? { ...user, ...updatedData } : user));
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
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
    );
};

export default ManageUsers;