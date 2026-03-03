import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Upload, 
  FileText, 
  Award, 
  X, 
  CheckCircle, 
  Clock,
  Eye,
  Trash2,
  Calendar,
  Building2
} from 'lucide-react';
import { submissionApi } from '../api/submissions';
import { certificateApi } from '../api/certificates';

export default function UploadSection() {
  const [activeTab, setActiveTab] = useState('report');
  const [submissions, setSubmissions] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);

  // Report form state
  const [reportForm, setReportForm] = useState({
    title: '',
    type: 'internship',
    domain: '',
    companyOrGuide: '',
    file: null
  });

  // Certificate form state
  const [certForm, setCertForm] = useState({
    title: '',
    type: 'internship',
    issuingOrganization: '',
    issueDate: '',
    expiryDate: '',
    file: null
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subRes, certRes] = await Promise.all([
        submissionApi.getMySubmissions(),
        certificateApi.getCertificates()
      ]);
      setSubmissions(subRes.data.submissions || []);
      setCertificates(certRes.data.certificates || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    
    if (!reportForm.file) {
      toast.error('Please select a PDF file');
      return;
    }

    const formData = new FormData();
    formData.append('pdf', reportForm.file);
    formData.append('title', reportForm.title);
    formData.append('type', reportForm.type);
    formData.append('domain', reportForm.domain);
    formData.append('companyOrGuide', reportForm.companyOrGuide);

    try {
      setLoading(true);
      await submissionApi.upload(formData);
      toast.success('Report uploaded successfully!');
      setReportForm({
        title: '',
        type: 'internship',
        domain: '',
        companyOrGuide: '',
        file: null
      });
      fetchData();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCertSubmit = async (e) => {
    e.preventDefault();
    
    if (!certForm.file) {
      toast.error('Please select a certificate PDF');
      return;
    }

    const formData = new FormData();
    formData.append('certificate', certForm.file);
    formData.append('title', certForm.title);
    formData.append('type', certForm.type);
    formData.append('issuingOrganization', certForm.issuingOrganization);
    formData.append('issueDate', certForm.issueDate);
    formData.append('expiryDate', certForm.expiryDate);

    try {
      setLoading(true);
      await certificateApi.uploadCertificate(formData);
      toast.success('Certificate uploaded successfully!');
      setCertForm({
        title: '',
        type: 'internship',
        issuingOrganization: '',
        issueDate: '',
        expiryDate: '',
        file: null
      });
      fetchData();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCert = async (id) => {
    if (!confirm('Are you sure you want to delete this certificate?')) return;
    
    try {
      await certificateApi.deleteCertificate(id);
      toast.success('Certificate deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete certificate');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-4 border-b">
        <button
          onClick={() => setActiveTab('report')}
          className={`pb-4 px-4 font-medium transition-colors relative ${
            activeTab === 'report' 
              ? 'text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Upload Report</span>
          </div>
          {activeTab === 'report' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('certificate')}
          className={`pb-4 px-4 font-medium transition-colors relative ${
            activeTab === 'certificate' 
              ? 'text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5" />
            <span>Upload Certificate</span>
          </div>
          {activeTab === 'certificate' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('view')}
          className={`pb-4 px-4 font-medium transition-colors relative ${
            activeTab === 'view' 
              ? 'text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Eye className="w-5 h-5" />
            <span>View All</span>
          </div>
          {activeTab === 'view' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
          )}
        </button>
      </div>

      {/* Report Upload Form */}
      {activeTab === 'report' && (
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Upload Report</h3>
          <form onSubmit={handleReportSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Summer Internship Report"
                  value={reportForm.title}
                  onChange={(e) => setReportForm({...reportForm, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={reportForm.type}
                  onChange={(e) => setReportForm({...reportForm, type: e.target.value})}
                >
                  <option value="internship">Internship</option>
                  <option value="project">Project</option>
                  <option value="research">Research</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Domain/Field</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Web Development, AI/ML"
                  value={reportForm.domain}
                  onChange={(e) => setReportForm({...reportForm, domain: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company/Guide</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Google Inc. / Prof. Smith"
                  value={reportForm.companyOrGuide}
                  onChange={(e) => setReportForm({...reportForm, companyOrGuide: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">PDF File</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  accept=".pdf"
                  required
                  className="hidden"
                  id="report-file"
                  onChange={(e) => setReportForm({...reportForm, file: e.target.files[0]})}
                />
                <label htmlFor="report-file" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">
                    {reportForm.file ? reportForm.file.name : 'Click to upload PDF'}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">Maximum file size: 10MB</p>
                </label>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>Upload Report</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Certificate Upload Form */}
      {activeTab === 'certificate' && (
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Upload Certificate</h3>
          <form onSubmit={handleCertSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Certificate Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., AWS Cloud Practitioner"
                  value={certForm.title}
                  onChange={(e) => setCertForm({...certForm, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={certForm.type}
                  onChange={(e) => setCertForm({...certForm, type: e.target.value})}
                >
                  <option value="internship">Internship</option>
                  <option value="course">Course</option>
                  <option value="workshop">Workshop</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Issuing Organization</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Amazon Web Services"
                  value={certForm.issuingOrganization}
                  onChange={(e) => setCertForm({...certForm, issuingOrganization: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Issue Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={certForm.issueDate}
                    onChange={(e) => setCertForm({...certForm, issueDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={certForm.expiryDate}
                    onChange={(e) => setCertForm({...certForm, expiryDate: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Certificate PDF</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  accept=".pdf"
                  required
                  className="hidden"
                  id="cert-file"
                  onChange={(e) => setCertForm({...certForm, file: e.target.files[0]})}
                />
                <label htmlFor="cert-file" className="cursor-pointer">
                  <Award className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">
                    {certForm.file ? certForm.file.name : 'Click to upload certificate PDF'}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">Maximum file size: 10MB</p>
                </label>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Award className="w-5 h-5" />
                  <span>Upload Certificate</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* View All */}
      {activeTab === 'view' && (
        <div className="space-y-6">
          {/* Reports Section */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">My Reports</h3>
            {submissions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No reports uploaded yet</p>
            ) : (
              <div className="space-y-4">
                {submissions.map((sub) => (
                  <div key={sub._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{sub.title}</p>
                        <p className="text-sm text-gray-500">{sub.type} • {new Date(sub.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(sub.status.toLowerCase())}`}>
                      {sub.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Certificates Section */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">My Certificates</h3>
            {certificates.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No certificates uploaded yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certificates.map((cert) => (
                  <div key={cert._id} className="p-4 border rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <Award className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{cert.title}</p>
                          <p className="text-sm text-gray-500">{cert.issuingOrganization}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteCert(cert._id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : 'N/A'}</span>
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(cert.status)}`}>
                        {cert.status}
                      </span>
                    </div>
                    <a
                      href={`http://localhost:5000${cert.filePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 w-full block text-center py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                    >
                      View Certificate
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
