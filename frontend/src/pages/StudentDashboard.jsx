import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  GraduationCap,
  FileText,
  Upload,
  LogOut,
  User,
  ChevronDown,
  CheckCircle,
  Clock,
  Award,
  Calendar,
  Search,
  Bell,
  Settings,
  FileCheck,
  UserCircle,
  Edit3,
  Lock
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { submissionApi } from '../api/submissions';
import TaskManager from '../components/TaskManager';
import UploadSection from '../components/UploadSection';
import ProfileModal from '../components/student/ProfileModal';
import UpdateProfileModal from '../components/student/UpdateProfileModal';
import ChangePasswordModal from '../components/student/ChangePasswordModal';

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const navigate = useNavigate();
  const { user, logout, setUser } = useAuthStore();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await submissionApi.getMySubmissions();
      setSubmissions(response.data.submissions || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleProfileUpdate = (updatedData) => {
    setUser({ ...user, ...updatedData });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-700';
      case 'Resubmission Required': return 'bg-red-100 text-red-700';
      case 'Assigned': return 'bg-blue-100 text-blue-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved': return <CheckCircle className="w-4 h-4" />;
      case 'Resubmission Required': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const recentSubmissions = submissions.slice(0, 5);

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
              <span className="text-xl font-bold text-slate-800">Student Dashboard</span>
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

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* User Info Header */}
                    <div className="px-4 py-4 border-b border-slate-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{user?.name}</p>
                          <p className="text-sm text-slate-500">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button 
                        onClick={() => { setShowProfileModal(true); setShowProfileMenu(false); }}
                        className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-blue-50 flex items-center space-x-3 transition-colors"
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <UserCircle className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-medium">Profile</span>
                      </button>

                      <button 
                        onClick={() => { setShowUpdateModal(true); setShowProfileMenu(false); }}
                        className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-blue-50 flex items-center space-x-3 transition-colors"
                      >
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <Edit3 className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span className="font-medium">Update Profile</span>
                      </button>

                      <button 
                        onClick={() => { setShowPasswordModal(true); setShowProfileMenu(false); }}
                        className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-blue-50 flex items-center space-x-3 transition-colors"
                      >
                        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                          <Lock className="w-4 h-4 text-amber-600" />
                        </div>
                        <span className="font-medium">Change Password</span>
                      </button>

                      <div className="border-t border-slate-100 my-2"></div>

                      <button 
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors"
                      >
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                          <LogOut className="w-4 h-4 text-red-600" />
                        </div>
                        <span className="font-medium">Logout</span>
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
          <p className="text-slate-500 mt-1">Track your activities and manage your submissions</p>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`p-6 rounded-2xl text-left transition-all ${
              activeTab === 'tasks' 
                ? 'bg-blue-500 text-white shadow-lg scale-105' 
                : 'bg-blue-400 text-white hover:bg-blue-500 shadow-md'
            }`}
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Task Manager</h3>
            <p className="text-blue-100 text-sm mt-1">Track your daily activities</p>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`p-6 rounded-2xl text-left transition-all ${
              activeTab === 'upload' 
                ? 'bg-blue-500 text-white shadow-lg scale-105' 
                : 'bg-blue-400 text-white hover:bg-blue-500 shadow-md'
            }`}
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Upload Submission</h3>
            <p className="text-blue-100 text-sm mt-1">Submit reports and certificates</p>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`p-6 rounded-2xl text-left transition-all ${
              activeTab === 'dashboard' 
                ? 'bg-blue-500 text-white shadow-lg scale-105' 
                : 'bg-blue-400 text-white hover:bg-blue-500 shadow-md'
            }`}
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold">View Submissions</h3>
            <p className="text-blue-100 text-sm mt-1">Check all your submissions</p>
          </button>
        </div>

        {/* Content Area */}
        {activeTab === 'tasks' && <TaskManager />}
        {activeTab === 'upload' && <UploadSection />}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Submissions Table */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Recent Submissions</h2>
                <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                  View All ?
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : recentSubmissions.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>No submissions yet</p>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Upload your first submission
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-medium text-slate-700">Title</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-700">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-700">Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentSubmissions.map((sub) => (
                        <tr key={sub._id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-4 px-4">
                            <div className="font-medium text-slate-900">{sub.title}</div>
                            <div className="text-sm text-slate-500">{sub.type}</div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(sub.status)}`}>
                              {getStatusIcon(sub.status)}
                              <span>{sub.status}</span>
                            </span>
                          </td>
                          <td className="py-4 px-4 text-slate-500">
                            {new Date(sub.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Side Panel */}
            <div className="space-y-6">
              {/* Recent Activity */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900">Recent Activity</h3>
                  <button className="text-blue-600 text-sm font-medium">View All ?</button>
                </div>
                <div className="space-y-4">
                  {recentSubmissions.slice(0, 3).map((sub, idx) => (
                    <div key={idx} className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Award className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{sub.title}</p>
                        <p className={`text-xs mt-1 ${sub.status === 'Approved' ? 'text-green-600' : 'text-yellow-600'}`}>
                          {sub.status}
                        </p>
                      </div>
                    </div>
                  ))}
                  {recentSubmissions.length === 0 && (
                    <p className="text-slate-500 text-sm text-center py-4">No recent activity</p>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
                <h3 className="font-bold mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-100">Total Submissions</span>
                    <span className="font-bold text-2xl">{submissions.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-100">Approved</span>
                    <span className="font-bold text-2xl">
                      {submissions.filter(s => s.status === 'Approved').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-100">Pending</span>
                    <span className="font-bold text-2xl">
                      {submissions.filter(s => s.status !== 'Approved').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal user={user} onClose={() => setShowProfileModal(false)} />
      )}

      {/* Update Profile Modal */}
      {showUpdateModal && (
        <UpdateProfileModal 
          user={user} 
          onClose={() => setShowUpdateModal(false)} 
          onUpdate={handleProfileUpdate}
        />
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </div>
  );
}
