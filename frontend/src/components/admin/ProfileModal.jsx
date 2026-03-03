import { X, User, Mail, Shield, Calendar } from 'lucide-react';

export default function ProfileModal({ user, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">Admin Profile</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <User className="w-12 h-12 text-white" />
            </div>
          </div>
          <div className="text-center mb-6">
            <h4 className="text-2xl font-bold text-slate-900">{user?.name}</h4>
            <p className="text-slate-500 capitalize">{user?.role}</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Email</p>
                <p className="font-medium text-slate-900">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Role</p>
                <p className="font-medium text-slate-900">Administrator</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Member Since</p>
                <p className="font-medium text-slate-900">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-full mt-6 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
