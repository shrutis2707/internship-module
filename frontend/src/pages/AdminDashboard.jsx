import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  Users, 
  FileText, 
  LogOut, 
  Search, 
  CheckCircle, 
  Clock,
  GraduationCap,
  UserCheck,
  ChevronDown,
  User,
  Settings,
  BarChart3,
  Edit3,
  Bell,
  X,
  UserPlus,
  ClipboardList,
  UserCircle
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { adminApi } from '../api/admin';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [assignForm, setAssignForm] = useState({
    submissionId: '',
    facultyId: ''
  });
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, submissionsRes, facultyRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers({ limit: 100 }),
        adminApi.getSubmissions({ limit: 100 }),
        adminApi.getFaculty()
      ]);
      
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users || []);
      setSubmissions(submissionsRes.data.submissions || []);
      setFaculty(facultyRes.data.faculty || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const openAssignModal = (submission) => {
    setSelectedSubmission(submission);
    setAssignForm({
      submissionId: submission._id,
      facultyId: ''
    });
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    
    if (!assignForm.facultyId) {
      toast.error('Please select a faculty member');
      return;
    }

    try {
      await adminApi.assignFaculty(assignForm);
      toast.success('Faculty assigned successfully!');
      setShowAssignModal(false);
      setSelectedSubmission(null);
      fetchData();
    } catch (error) {
      console.error('Assign error:', error);
      toast.error(error.response?.data?.message || 'Failed to assign faculty');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'Resubmission Required': return 'bg-red-100 text-red-700 border-red-200';
      case 'Assigned': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Submitted': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved': return <CheckCircle className="w-4 h-4" />;
      case 'Assigned': return <UserCheck className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700';
      case 'faculty': return 'bg-blue-100 text-blue-700';
      case 'student': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500 p-2 rounded-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800">Admin Dashboard</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
              
              <button className="relative p-2 text-slate-500 hover:text-slate-700">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-100"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="font-semibold text-slate-900">{user?.name}</p>
                      <p className="text-sm text-slate-500">{user?.email}</p>
                    </div>
                    <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2">
                      <UserCircle className="w-4 h-4" />
                      <span>Profile</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab('users')}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                    >
                      <Users className="w-4 h-4" />
                      <span>Manage Users</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab('submissions')}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                    >
                      <ClipboardList className="w-4 h-4" />
                      <span>All Submissions</span>
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2">
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    <div className="border-t border-slate-100 mt-2 pt-2">
                      <button 
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-slate-500 mt-1">Manage users, submissions, and faculty assignments</p>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`p-6 rounded-2xl text-left transition-all ${
              activeTab === 'users' 
                ? 'bg-blue-500 text-white shadow-lg scale-105' 
                : 'bg-blue-400 text-white hover:bg-blue-500 shadow-md'
            }`}
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Manage Users</h3>
            <p className="text-blue-100 text-sm mt-1">View & edit user roles</p>
          </button>

          <button
            onClick={() => setActiveTab('submissions')}
            className={`p-6 rounded-2xl text-left transition-all ${
              activeTab === 'submissions' 
                ? 'bg-blue-500 text-white shadow-lg scale-105' 
                : 'bg-blue-400 text-white hover:bg-blue-500 shadow-md'
            }`}
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold">All Submissions</h3>
            <p className="text-blue-100 text-sm mt-1">Oversee all reports</p>
          </button>

          <button
            onClick={() => setActiveTab('assign')}
            className={`p-6 rounded-2xl text-left transition-all ${
              activeTab === 'assign' 
                ? 'bg-blue-500 text-white shadow-lg scale-105' 
                : 'bg-blue-400 text-white hover:bg-blue-500 shadow-md'
            }`}
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Assign Faculty</h3>
            <p className="text-blue-100 text-sm mt-1">Check and allocate reviewers</p>
          </button>
        </div>

        {/* Main Content */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Users List</h2>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2">
                <UserPlus className="w-4 h-4" />
                <span>Add User</span>
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Role</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Department</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((userItem) => (
                      <tr key={userItem._id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="font-medium text-slate-900">{userItem.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getRoleColor(userItem.role)}`}>
                            {userItem.role}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-600">{userItem.email}</td>
                        <td className="py-4 px-4 text-slate-600">{userItem.dept || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="mt-4 text-sm text-slate-500">
              View and manage user accounts and roles.
            </p>
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">All Submissions</h2>
                <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                  View All ?
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-medium text-slate-700">Student</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-700">Title</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-700">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-700">Faculty</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-700">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((sub) => (
                        <tr key={sub._id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-blue-600" />
                              </div>
                              <span className="font-medium text-slate-900">{sub.studentId?.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-medium text-slate-900">{sub.title}</p>
                            <p className="text-sm text-slate-500">{sub.type}</p>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(sub.status)}`}>
                              {getStatusIcon(sub.status)}
                              <span>{sub.status}</span>
                            </span>
                          </td>
                          <td className="py-4 px-4 text-slate-600">
                            {sub.assignedFacultyId?.name || 'Unassigned'}
                          </td>
                          <td className="py-4 px-4">
                            {!sub.assignedFacultyId ? (
                              <button
                                onClick={() => openAssignModal(sub)}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
                              >
                                Assign
                              </button>
                            ) : (
                              <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm font-medium">
                                View
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Assign Faculty Panel */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Assign Faculty</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Submission ID</label>
                  <input
                    type="text"
                    placeholder="Enter submission ID"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={assignForm.submissionId}
                    onChange={(e) => setAssignForm({...assignForm, submissionId: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Faculty ID</label>
                  <select
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={assignForm.facultyId}
                    onChange={(e) => setAssignForm({...assignForm, facultyId: e.target.value})}
                  >
                    <option value="">Select Faculty</option>
                    {faculty.map((f) => (
                      <option key={f._id} value={f._id}>{f.name} - {f.dept}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleAssignSubmit}
                  className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
                >
                  Assign
                </button>
                <p className="text-sm text-slate-500">
                  Allocate a faculty member to review a submission.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'assign' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Pending Assignments</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Student</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Title</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Submitted</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.filter(s => s.status === 'Submitted').map((sub) => (
                    <tr key={sub._id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <span className="font-medium text-slate-900">{sub.studentId?.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-medium text-slate-900">{sub.title}</td>
                      <td className="py-4 px-4">
                        <span className="capitalize text-slate-600">{sub.type}</span>
                      </td>
                      <td className="py-4 px-4 text-slate-600">
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => openAssignModal(sub)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
                        >
                          Assign Faculty
                        </button>
                      </td>
                    </tr>
                  ))}
                  {submissions.filter(s => s.status === 'Submitted').length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-500">
                        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                        <p>No pending assignments</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">Total Users</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stats?.users?.total || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">Students</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stats?.users?.students || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">Faculty</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stats?.users?.faculty || 0}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">Submissions</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stats?.submissions?.total || 0}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Assign Modal */}
      {showAssignModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Assign Faculty</h3>
              <button 
                onClick={() => setShowAssignModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500">Submission</p>
                <p className="font-medium text-slate-900">{selectedSubmission.title}</p>
                <p className="text-sm text-slate-500 mt-2">Student</p>
                <p className="font-medium text-slate-900">{selectedSubmission.studentId?.name}</p>
              </div>

              <form onSubmit={handleAssignSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Select Faculty</label>
                  <select
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={assignForm.facultyId}
                    onChange={(e) => setAssignForm({...assignForm, facultyId: e.target.value})}
                    required
                  >
                    <option value="">Choose a faculty member</option>
                    {faculty.map((f) => (
                      <option key={f._id} value={f._id}>{f.name} - {f.dept}</option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
                  >
                    Assign
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
