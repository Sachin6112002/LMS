import React, { useState } from 'react';

const AdminSettings = () => {
    const [settings, setSettings] = useState({
        siteName: 'Learning Management System',
        adminEmail: 'admin@example.com',
        maintenanceMode: false,
        theme: 'light',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSettings({ ...settings, [name]: value });
    };

    const handleToggleMaintenance = () => {
        setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode });
    };

    const handleThemeToggle = () => {
        setSettings({ ...settings, theme: settings.theme === 'light' ? 'dark' : 'light' });
    };

    const handleReset = () => {
        setSettings({
            siteName: 'Learning Management System',
            adminEmail: 'admin@example.com',
            maintenanceMode: false,
            theme: 'light',
        });
    };

    const handleSave = () => {
        alert('Settings saved successfully!');
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Admin Settings</h1>
            <p className="mb-6">Manage your settings here.</p>
            <div className="space-y-4">
                <div>
                    <label className="block text-gray-700 font-medium mb-2">Site Name</label>
                    <input
                        type="text"
                        name="siteName"
                        value={settings.siteName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-gray-700 font-medium mb-2">Admin Email</label>
                    <input
                        type="email"
                        name="adminEmail"
                        value={settings.adminEmail}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <label className="text-gray-700 font-medium">Maintenance Mode</label>
                    <button
                        onClick={handleToggleMaintenance}
                        className={`px-4 py-2 rounded-lg ${settings.maintenanceMode ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
                    >
                        {settings.maintenanceMode ? 'Disable' : 'Enable'}
                    </button>
                </div>
                <div className="flex items-center gap-4">
                    <label className="text-gray-700 font-medium">Theme</label>
                    <button
                        onClick={handleThemeToggle}
                        className={`px-4 py-2 rounded-lg ${settings.theme === 'light' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-white'}`}
                    >
                        {settings.theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                    </button>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleSave}
                        className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                    >
                        Save Settings
                    </button>
                    <button
                        onClick={handleReset}
                        className="mt-4 bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                    >
                        Reset to Default
                    </button>
                </div>
            </div>
        </div>
    );
};



export default AdminSettings;