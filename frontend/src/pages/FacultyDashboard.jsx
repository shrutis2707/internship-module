import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  GraduationCap, 
  FileText, 
  LogOut, 
  User, 
  ChevronDown,
  CheckCircle,
  Clock,
  Search,
  Bell,
  Settings,
  ClipboardCheck,
  BarChart3,
  Eye,
  Edit3,
  X,
  Award,
  UserCircle,
  Lock
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { facultyApi } from '../api/faculty';
import ProfileModal from '../components/faculty/ProfileModal';
import UpdateProfileModal from '../components/faculty/UpdateProfileModal';
import ChangePasswordModal from '../components/faculty/ChangePasswordModal';

export default function FacultyDashboard() {
  const [activeTab, setActiveTab] = useState('assigned');
  const [submissions, setSubmissions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ assigned: 0, reviewed: 0 });
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    decision: 'Approved',
    marks: '',
    remarks: ''
  });
  const navigate = useNavigate();
  const { user, logout, setUser } = useAuthStore();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assignedRes, reviewedRes] = await Promise.all([
        facultyApi.getAssignedSubmissions(),
        facultyApi.getReviewedSubmissions()
      ]);
      
      setSubmissions(assignedRes.data.submissions || []);
      setReviews(reviewedRes.data.reviews || []);
      setStats({
        assigned: assignedRes.data.submissions?.length || 0,
        reviewed: reviewedRes.data.reviews?.length || 0
      });
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

  const handleProfileUpdate = (updatedData) => {
    setUser({ ...user, ...updatedData });
  };

  const openReviewModal = (submission) => {
    setSelectedSubmission(submission);
    setReviewForm({
      decision: 'Approved',
      marks: '',
      remarks: ''
    });
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await facultyApi.reviewSubmission({
        submissionId: selectedSubmission._id,
        ...reviewForm
      });
      
      toast.success('Review submitted successfully!');
      setShowReviewModal(false);
      setSelectedSubmission(null);
      fetchData();
    } catch (error) {
      console.error('Review error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
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

  const recentReviews = reviews.slice(0, 5);

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
              <span className="text-xl font-bold text-slate-800">Faculty Dashboard</span>
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
          <p className="text-slate-500 mt-1">Review and evaluate student submissions</p>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => setActiveTab('assigned')}
            className={`p-6 rounded-2xl text-left transition-all ${
              activeTab === 'assigned' 
                ? 'bg-blue-500 text-white shadow-lg scale-105' 
                : 'bg-blue-400 text-white hover:bg-blue-500 shadow-md'
            }`}
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <ClipboardCheck className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Assigned Submissions</h3>
            <p className="text-blue-100 text-sm mt-1">Pending tasks requiring review</p>
          </button>

          <button
            onClick={() => setActiveTab('reviewed')}
            className={`p-6 rounded-2xl text-left transition-all ${
              activeTab === 'reviewed' 
                ? 'bg-blue-500 text-white shadow-lg scale-105' 
                : 'bg-blue-400 text-white hover:bg-blue-500 shadow-md'
            }`}
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Reviewed Submissions</h3>
            <p className="text-blue-100 text-sm mt-1">Total reviews completed</p>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`p-6 rounded-2xl text-left transition-all ${
              activeTab === 'stats' 
                ? 'bg-blue-500 text-white shadow-lg scale-105' 
                : 'bg-blue-400 text-white hover:bg-blue-500 shadow-md'
            }`}
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold">View Statistics</h3>
            <p className="text-blue-100 text-sm mt-1">Check your review analytics</p>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Submissions Table */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                  {activeTab === 'assigned' ? 'Assigned Submissions' : 
                   activeTab === 'reviewed' ? 'Reviewed Submissions' : 'Statistics'}
                </h2>
                {activeTab !== 'stats' && (
                  <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                    View All ?
                  </button>
                )}
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : activeTab === 'stats' ? (
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-xl p-6 text-center">
                    <p className="text-4xl font-bold text-blue-600">{stats.assigned}</p>
                    <p className="text-slate-600 mt-2">Assigned Submissions</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-6 text-center">
                    <p className="text-4xl font-bold text-green-600">{stats.reviewed}</p>
                    <p className="text-slate-600 mt-2">Reviews Completed</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-6 text-center">
                    <p className="text-4xl font-bold text-purple-600">
                      {reviews.filter(r => r.decision === 'Approved').length}
                    </p>
                    <p className="text-slate-600 mt-2">Approved</p>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-6 text-center">
                    <p className="text-4xl font-bold text-orange-600">
                      {reviews.filter(r => r.decision === 'Resubmission Required').length}
                    </p>
                    <p className="text-slate-600 mt-2">Resubmissions</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-medium text-slate-700">Student</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-700">Type</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-700">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-700">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(activeTab === 'assigned' ? submissions : reviews.map(r => ({...r, studentId: r.studentId || {}}))).map((item) => (
                        <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-slate-900">{item.studentId?.name || 'Unknown'}</p>
                                <p className="text-sm text-slate-500">{item.title}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-slate-700 capitalize">{item.type}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                              getStatusColor(activeTab === 'assigned' ? 'Assigned' : item.decision)
                            }`}>
                              {getStatusIcon(activeTab === 'assigned' ? 'Assigned' : item.decision)}
                              <span>{activeTab === 'assigned' ? 'Pending' : item.decision}</span>
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            {activeTab === 'assigned' ? (
                              <button
                                onClick={() => openReviewModal(item)}
                                className="flex items-center space-x-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                                <span>Review</span>
                              </button>
                            ) : (
                              <button className="flex items-center space-x-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                                <Eye className="w-4 h-4" />
                                <span>View</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {(activeTab === 'assigned' ? submissions : reviews).length === 0 && (
                        <tr>
                          <td colSpan="4" className="py-12 text-center text-slate-500">
                            <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                            <p>No {activeTab === 'assigned' ? 'assigned' : 'reviewed'} submissions</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab !== 'stats' && (
                <p className="mt-4 text-sm text-slate-500">
                  Evaluate and review student submissions for internships and projects.
                </p>
              )}
            </div>
          </div>

          {/* Right Panel - Recent Reviews */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900">Recent Reviews</h3>
              <button className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center">
                View All <ChevronDown className="w-4 h-4 ml-1 rotate-[-90deg]" />
              </button>
            </div>
            <div className="space-y-4">
              {recentReviews.map((review, idx) => (
                <div key={idx} className="flex items-start space-x-3 pb-4 border-b border-slate-100 last:border-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 text-sm">{review.title}</p>
                    <p className={`text-xs mt-1 ${review.decision === 'Approved' ? 'text-green-600' : 'text-orange-600'}`}>
                      {review.decision}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {recentReviews.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-4">No recent reviews</p>
              )}
            </div>
            
            <button className="w-full mt-6 text-center text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center justify-center">
              View All <ChevronDown className="w-4 h-4 ml-1 rotate-[-90deg]" />
            </button>
          </div>
        </div>
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

      {/* Review Modal */}
      {showReviewModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Review Submission</h3>
              <button 
                onClick={() => setShowReviewModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500">Student</p>
                <p className="font-medium text-slate-900">{selectedSubmission.studentId?.name}</p>
                <p className="text-sm text-slate-500 mt-2">Title</p>
                <p className="font-medium text-slate-900">{selectedSubmission.title}</p>
                <p className="text-sm text-slate-500 mt-2">Type</p>
                <p className="font-medium text-slate-900 capitalize">{selectedSubmission.type}</p>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Decision</label>
                  <select
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={reviewForm.decision}
                    onChange={(e) => setReviewForm({...reviewForm, decision: e.target.value})}
                  >
                    <option value="Approved">Approved</option>
                    <option value="Resubmission Required">Resubmission Required</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Marks (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter marks"
                    value={reviewForm.marks}
                    onChange={(e) => setReviewForm({...reviewForm, marks: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Remarks</label>
                  <textarea
                    rows="3"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your remarks..."
                    value={reviewForm.remarks}
                    onChange={(e) => setReviewForm({...reviewForm, remarks: e.target.value})}
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
                  >
                    Submit Review
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
