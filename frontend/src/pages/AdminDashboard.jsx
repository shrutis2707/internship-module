import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Users, FileText, LogOut, User, Shield, Download, CheckCircle,
  Loader2, Search, GraduationCap, UserCheck, BookOpen, LayoutDashboard,
  ChevronLeft, ChevronRight, Filter
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { adminApi } from '../api/auth';
import { formatDate, getStatusColor } from '../lib/utils';

export default function AdminDashboard() {
  const { user, logout } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats().then(res => res.data),
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users', page, searchTerm],
    queryFn: () => adminApi.getUsers({ page, search: searchTerm }).then(res => res.data),
  });

  const { data: submissionsData, isLoading: submissionsLoading } = useQuery({
    queryKey: ['submissions', page, searchTerm],
    queryFn: () => adminApi.getSubmissions({ page, search: searchTerm }).then(res => res.data),
  });

  const { data: facultyData } = useQuery({
    queryKey: ['faculty-list'],
    queryFn: () => adminApi.getFaculty().then(res => res.data),
  });

  const assignMutation = useMutation({
    mutationFn: adminApi.assignFaculty,
    onSuccess: () => {
      toast.success('Faculty assigned successfully!');
      setSelectedSubmission(null);
      setSelectedFaculty('');
      queryClient.invalidateQueries(['submissions']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Assignment failed');
    },
  });

  const handleAssign = (e) => {
    e.preventDefault();
    assignMutation.mutate({
      submissionId: selectedSubmission._id,
      facultyId: selectedFaculty,
    });
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const adminStats = stats?.stats;
  const users = usersData?.users || [];
  const submissions = submissionsData?.submissions || [];
  const faculty = facultyData?.faculty || [];

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{adminStats?.users?.total || 0}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex space-x-4 text-sm">
            <span className="text-gray-500">
              Students: <span className="font-medium text-gray-900">{adminStats?.users?.students || 0}</span>
            </span>
            <span className="text-gray-500">
              Faculty: <span className="font-medium text-gray-900">{adminStats?.users?.faculty || 0}</span>
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Submissions</p>
              <p className="text-3xl font-bold text-gray-900">{adminStats?.submissions?.total || 0}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            All time submissions
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Review</p>
              <p className="text-3xl font-bold text-yellow-600">{adminStats?.submissions?.pending || 0}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <BookOpen className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Awaiting faculty assignment
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Approved</p>
              <p className="text-3xl font-bold text-green-600">{adminStats?.submissions?.approved || 0}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Successfully reviewed
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Recent Submissions</h3>
          </div>
          <div className="divide-y">
            {submissions.slice(0, 5).map((sub) => (
              <div key={sub._id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{sub.title}</p>
                    <p className="text-sm text-gray-500">
                      by {sub.studentId?.name} • {formatDate(sub.createdAt)}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(sub.status)}`}>
                    {sub.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Recent Users</h3>
          </div>
          <div className="divide-y">
            {users.slice(0, 5).map((user) => (
              <div key={user._id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    user.role === 'admin' ? 'bg-red-100 text-red-800' :
                    user.role === 'faculty' ? 'bg-purple-100 text-purple-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">All Users</h3>
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {usersLoading ? (
        <div className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
        </div>
      ) : (
        <>
          <div className="divide-y">
            {users.map((user) => (
              <div key={user._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      user.role === 'admin' ? 'bg-red-100' :
                      user.role === 'faculty' ? 'bg-purple-100' : 'bg-blue-100'
                    }`}>
                      <User className={`w-5 h-5 ${
                        user.role === 'admin' ? 'text-red-600' :
                        user.role === 'faculty' ? 'text-purple-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <div className="flex items-center space-x-2 mt-1 text-sm text-gray-400">
                        <span>{user.dept}</span>
                        {user.year && <span>• {user.year}</span>}
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.role === 'admin' ? 'bg-red-100 text-red-800' :
                    user.role === 'faculty' ? 'bg-purple-100 text-purple-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {usersData?.pagination && usersData.pagination.pages > 1 && (
            <div className="p-4 border-t flex items-center justify-between">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center space-x-1 px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {usersData.pagination.pages}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= usersData.pagination.pages}
                className="flex items-center space-x-1 px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderSubmissions = () => (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">All Submissions</h3>
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search submissions..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {submissionsLoading ? (
        <div className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
        </div>
      ) : (
        <>
          <div className="divide-y">
            {submissions.map((sub) => (
              <div key={sub._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{sub.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(sub.status)}`}>
                        {sub.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{sub.studentId?.name}</span>
                      </span>
                      <span className="capitalize">{sub.type}</span>
                      <span>{formatDate(sub.createdAt)}</span>
                    </div>
                    {sub.assignedFacultyId && (
                      <p className="text-sm text-gray-600 mt-1">
                        Assigned to: <span className="font-medium">{sub.assignedFacultyId.name}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <a
                      href={`http://localhost:5000${sub.filePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                      title="View PDF"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                    {(sub.status === 'Submitted' || !sub.assignedFacultyId) && (
                      <button
                        onClick={() => setSelectedSubmission(sub)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        Assign
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {submissionsData?.pagination && submissionsData.pagination.pages > 1 && (
            <div className="p-4 border-t flex items-center justify-between">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center space-x-1 px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {submissionsData.pagination.pages}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= submissionsData.pagination.pages}
                className="flex items-center space-x-1 px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Portal</h1>
              <p className="text-sm text-gray-500">Manage users and submissions</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-600">
              <User className="w-5 h-5" />
              <span className="font-medium">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'users' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Users className="w-5 h-5" />
                <span>Users</span>
              </button>
              <button
                onClick={() => setActiveTab('submissions')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'submissions' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>Submissions</span>
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'submissions' && renderSubmissions()}
          </main>
        </div>
      </div>

      {/* Assign Faculty Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Assign Faculty</h2>
              <p className="text-gray-500 text-sm mt-1">{selectedSubmission.title}</p>
            </div>

            <form onSubmit={handleAssign} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Faculty
                </label>
                <select
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={selectedFaculty}
                  onChange={(e) => setSelectedFaculty(e.target.value)}
                >
                  <option value="">Choose a faculty member...</option>
                  {faculty.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.name} ({f.email}) - {f.dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedSubmission(null)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignMutation.isPending}
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center"
                >
                  {assignMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    'Assign Faculty'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}