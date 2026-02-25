import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Upload, FileText, LogOut, User, BookOpen, Building2, Tag,
  Download, MessageSquare, Loader2, CheckCircle, Clock, AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { submissionApi } from '../api/auth';
import { formatDate, getStatusColor } from '../lib/utils';

export default function StudentDashboard() {
  const { user, logout } = useAuthStore();
  const queryClient = useQueryClient();
  const [uploadForm, setUploadForm] = useState({
    title: '',
    type: 'internship',
    domain: '',
    companyOrGuide: '',
    report: null,
  });

  const { data: submissionsData, isLoading } = useQuery({
    queryKey: ['my-submissions'],
    queryFn: () => submissionApi.getMine().then(res => res.data),
  });

  const uploadMutation = useMutation({
    mutationFn: submissionApi.upload,
    onSuccess: () => {
      toast.success('Submission uploaded successfully!');
      setUploadForm({ title: '', type: 'internship', domain: '', companyOrGuide: '', report: null });
      queryClient.invalidateQueries(['my-submissions']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Upload failed');
    },
  });

  const handleUpload = (e) => {
    e.preventDefault();
    if (!uploadForm.report) {
      toast.error('Please select a PDF file');
      return;
    }
    uploadMutation.mutate(uploadForm);
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const submissions = submissionsData?.submissions || [];
  const reviews = submissionsData?.reviews || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Student Portal</h1>
              <p className="text-sm text-gray-500">Submit and track your reports</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Upload className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold">New Submission</h2>
              </div>

              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Enter report title"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    value={uploadForm.type}
                    onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
                  >
                    <option value="internship">Internship</option>
                    <option value="project">Final Year Project</option>
                    <option value="research">Research</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Domain
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="AI, Web, Data Science..."
                    value={uploadForm.domain}
                    onChange={(e) => setUploadForm({ ...uploadForm, domain: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company / Guide
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Company or Guide Name"
                    value={uploadForm.companyOrGuide}
                    onChange={(e) => setUploadForm({ ...uploadForm, companyOrGuide: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PDF File
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={(e) => setUploadForm({ ...uploadForm, report: e.target.files[0] })}
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum file size: 10MB</p>
                </div>

                <button
                  type="submit"
                  disabled={uploadMutation.isPending}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {uploadMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      Submit Report
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Submissions List */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Submissions */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold">My Submissions</h2>
                </div>
              </div>

              {isLoading ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                </div>
              ) : submissions.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No submissions yet</p>
                  <p className="text-sm">Upload your first report using the form</p>
                </div>
              ) : (
                <div className="divide-y">
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
                              <Tag className="w-4 h-4" />
                              <span className="capitalize">{submission.type}</span>
                            </span>
                            {submission.domain && (
                              <span className="flex items-center space-x-1">
                                <Building2 className="w-4 h-4" />
                                <span>{submission.domain}</span>
                              </span>
                            )}
                            <span className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{formatDate(submission.createdAt)}</span>
                            </span>
                          </div>
                          {submission.assignedFacultyId && (
                            <p className="text-sm text-gray-600 mt-2">
                              Assigned to: <span className="font-medium">{submission.assignedFacultyId.name}</span>
                            </p>
                          )}
                        </div>
                        <a
                          href={`http://localhost:5000${submission.filePath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          <span>View</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reviews */}
            {reviews.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6 border-b">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                    <h2 className="text-lg font-semibold">Feedback & Reviews</h2>
                  </div>
                </div>
                <div className="divide-y">
                  {reviews.map((review) => (
                    <div key={review._id} className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className={`p-2 rounded-lg ${review.decision === 'Approved' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                          {review.decision === 'Approved' ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              review.decision === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {review.decision}
                            </span>
                            <span className="text-sm text-gray-500">
                              by {review.facultyId?.name}
                            </span>
                          </div>
                          {review.remarks && (
                            <p className="text-gray-700 mt-2">{review.remarks}</p>
                          )}
                          {review.marks > 0 && (
                            <p className="text-sm text-gray-500 mt-1">
                              Marks: <span className="font-medium">{review.marks}/100</span>
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            {formatDate(review.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}