import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ClipboardList, LogOut, User, GraduationCap, Download, MessageSquare,
  Loader2, CheckCircle, XCircle, Star, FileText, Clock, BarChart3,
  CheckCircle2, AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { facultyApi } from '../api/auth';
import { formatDate, getStatusColor } from '../lib/utils';

export default function FacultyDashboard() {
  const { user, logout } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    marks: '',
    decision: 'Approved',
    remarks: '',
  });

  const { data: stats } = useQuery({
    queryKey: ['faculty-stats'],
    queryFn: () => facultyApi.getStats().then(res => res.data),
  });

  const { data: assignedData, isLoading } = useQuery({
    queryKey: ['assigned-submissions'],
    queryFn: () => facultyApi.getAssigned().then(res => res.data),
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['my-reviews'],
    queryFn: () => facultyApi.getReviews().then(res => res.data),
  });

  const reviewMutation = useMutation({
    mutationFn: facultyApi.submitReview,
    onSuccess: () => {
      toast.success('Review submitted successfully!');
      setSelectedSubmission(null);
      setReviewForm({ marks: '', decision: 'Approved', remarks: '' });
      queryClient.invalidateQueries(['assigned-submissions']);
      queryClient.invalidateQueries(['my-reviews']);
      queryClient.invalidateQueries(['faculty-stats']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Review submission failed');
    },
  });

  const handleReview = (e) => {
    e.preventDefault();
    reviewMutation.mutate({
      submissionId: selectedSubmission._id,
      ...reviewForm,
    });
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const submissions = assignedData?.submissions || [];
  const reviews = reviewsData?.reviews || [];
  const facultyStats = stats?.stats;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-600 p-2 rounded-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Faculty Portal</h1>
              <p className="text-sm text-gray-500">Review and evaluate submissions</p>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        {facultyStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Assigned</p>
                  <p className="text-2xl font-bold text-gray-900">{facultyStats.assigned}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <ClipboardList className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-600">{facultyStats.pending}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{facultyStats.approved}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Resubmissions</p>
                  <p className="text-2xl font-bold text-red-600">{facultyStats.resubmissions}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Assigned Submissions */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex items-center space-x-2">
                <ClipboardList className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold">Assigned Submissions</h2>
              </div>
            </div>

            {isLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600" />
              </div>
            ) : submissions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <ClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No submissions assigned yet</p>
              </div>
            ) : (
              <div className="divide-y max-h-[500px] overflow-y-auto">
                {submissions.map((submission) => (
                  <div key={submission._id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{submission.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                            {submission.status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{submission.studentId?.name}</span>
                          </span>
                          <span className="capitalize">{submission.type}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {submission.studentId?.dept} • {submission.studentId?.year}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <a
                          href={`http://localhost:5000${submission.filePath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="View PDF"
                        >
                          <Download className="w-5 h-5" />
                        </a>
                        {(submission.status === 'Submitted' || submission.status === 'Assigned') && (
                          <button
                            onClick={() => setSelectedSubmission(submission)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            Review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Reviews */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold">My Review History</h2>
              </div>
            </div>

            {reviews.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No reviews submitted yet</p>
              </div>
            ) : (
              <div className="divide-y max-h-[500px] overflow-y-auto">
                {reviews.map((review) => (
                  <div key={review._id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start space-x-4">
                      <div className={`p-2 rounded-lg ${review.decision === 'Approved' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                        {review.decision === 'Approved' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-yellow-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {review.submissionId?.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Student: {review.submissionId?.studentId?.name}
                        </p>
                        <div className="flex items-center space-x-3 mt-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            review.decision === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {review.decision}
                          </span>
                          {review.marks > 0 && (
                            <span className="flex items-center space-x-1 text-sm text-gray-600">
                              <Star className="w-4 h-4" />
                              <span>{review.marks}/100</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Review Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Evaluate Submission</h2>
              <p className="text-gray-500 text-sm mt-1">{selectedSubmission.title}</p>
            </div>

            <form onSubmit={handleReview} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marks (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="Enter marks"
                  value={reviewForm.marks}
                  onChange={(e) => setReviewForm({ ...reviewForm, marks: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Decision
                </label>
                <select
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  value={reviewForm.decision}
                  onChange={(e) => setReviewForm({ ...reviewForm, decision: e.target.value })}
                >
                  <option value="Approved">Approved</option>
                  <option value="Resubmission Required">Resubmission Required</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks / Feedback
                </label>
                <textarea
                  rows="4"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                  placeholder="Provide feedback to the student..."
                  value={reviewForm.remarks}
                  onChange={(e) => setReviewForm({ ...reviewForm, remarks: e.target.value })}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedSubmission(null)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewMutation.isPending}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {reviewMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Review'
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