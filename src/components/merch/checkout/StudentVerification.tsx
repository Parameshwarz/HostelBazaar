import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Mail, GraduationCap, School, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface StudentVerificationProps {
  onVerificationComplete: (code: string) => void;
}

const StudentVerification: React.FC<StudentVerificationProps> = ({ onVerificationComplete }) => {
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [university, setUniversity] = useState('');
  const [role, setRole] = useState<'student' | 'faculty'>('student');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Here you would typically send the verification request to your backend
      // For now, we'll simulate a successful verification
      const verificationCode = 'STUDENT25'; // This would come from your backend
      toast.success('Verification successful! Discount applied.');
      onVerificationComplete(verificationCode);
    } catch (error) {
      toast.error('Verification failed. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Student/Faculty Verification</h2>
          <button
            onClick={() => onVerificationComplete('')}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Role</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={role === 'student'}
                  onChange={(e) => setRole(e.target.value as 'student' | 'faculty')}
                  className="h-4 w-4 text-blue-600"
                />
                <span>Student</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="role"
                  value="faculty"
                  checked={role === 'faculty'}
                  onChange={(e) => setRole(e.target.value as 'student' | 'faculty')}
                  className="h-4 w-4 text-blue-600"
                />
                <span>Faculty</span>
              </label>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              University Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.name@university.edu"
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {role === 'student' ? 'Student ID' : 'Faculty ID'}
            </label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder={role === 'student' ? 'Enter student ID' : 'Enter faculty ID'}
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              University Name
            </label>
            <div className="relative">
              <School className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="Enter university name"
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 text-white transition-colors hover:bg-blue-700"
          >
            <Send size={20} />
            <span>Verify & Get Discount</span>
          </button>

          <p className="text-center text-sm text-gray-500">
            * Verification may take a few moments. You'll receive a confirmation email once verified.
          </p>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default StudentVerification; 