// c:\Users\Roxx9\Desktop\j2ee\src\components\dashboard\AdminDashboard.tsx
'use client';

import React, { useEffect, useState } from 'react';

// Define a type for a user (adjust as per your Prisma schema User model)
interface UserDisplayInfo {
  id: string;
  name: string | null;
  email: string | null;
  role: string; // Consider using the Role enum from Prisma if imported
  createdAt: string; // Or Date
}

interface AdminDashboardProps {
  adminId: string; // The ID of the currently logged-in admin
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ adminId }) => {
  const [users, setUsers] = useState<UserDisplayInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      // TODO: Replace with actual API call: /api/users (admin protected)
      try {
        // Simulating API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockUsers: UserDisplayInfo[] = [
          { id: 'user1', name: 'Alice Patient', email: 'alice@example.com', role: 'PATIENT', createdAt: new Date().toISOString() },
          { id: 'user2', name: 'Dr. Bob Smith', email: 'bob.smith@example.com', role: 'DOCTOR', createdAt: new Date().toISOString() },
          { id: 'user3', name: 'Charlie Admin', email: 'charlie.admin@example.com', role: 'ADMIN', createdAt: new Date().toISOString() },
        ];
        setUsers(mockUsers);
      } catch (err) {
        setError('Failed to fetch users.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []); // Fetch users once on component mount

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">User Management</h3>
        <button 
          className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
          // TODO: Implement functionality to add a new user (e.g., open a modal or navigate to a form)
          onClick={() => alert('Open add user form/modal...')}
        >
          Add New User
        </button>
      </div>

      {isLoading && <p>Loading users...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      {!isLoading && !error && users.length === 0 && (
        <p>No users found in the system.</p>
      )}

      {!isLoading && !error && users.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Name</th>
                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Email</th>
                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Role</th>
                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Joined</th>
                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {users.map(user => (
                <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4">{user.name || 'N/A'}</td>
                  <td className="py-3 px-4">{user.email || 'N/A'}</td>
                  <td className="py-3 px-4">{user.role}</td>
                  <td className="py-3 px-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    {/* TODO: Implement edit/delete user functionality */}
                    <button className="text-blue-500 hover:underline mr-2 text-sm">Edit</button>
                    <button className="text-red-500 hover:underline text-sm">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;