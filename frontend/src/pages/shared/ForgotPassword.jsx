import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, KeyRound, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, Lock } from 'lucide-react';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [passwords, setPasswords] = useState({ new: '', confirm: '' });

  const handleSendOtp = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setStep(3);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alert("Passwords do not match!");
      return;
    }
    setStep(4);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center animate-fade-in-up py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* Step 1: Enter Email */}
        {step === 1 && (
          <div className="p-8 sm:p-10 animate-fade-in-up">
            <div className="text-center mb-8">
              <div className="mx-auto inline-flex items-center justify-center p-3 bg-teal-50 rounded-2xl mb-5 border border-teal-100 shadow-sm">
                <KeyRound className="h-8 w-8 text-teal-600" />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Reset Password</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Enter the email address associated with your account and we'll send a 6-digit OTP to verify your identity.
              </p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 bg-white border border-slate-300 text-slate-900 rounded-xl p-3.5 focus:ring-teal-500 focus:border-teal-500 shadow-sm transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-[0_0_15px_rgba(13,148,136,0.2)] text-base font-bold text-white bg-teal-600  focus:outline-none transition-all transform hover:-translate-y-0.5"
              >
                Send OTP
                <ArrowRight className="h-5 w-5 ml-2" />
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <Link to="/login" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-teal-600 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Back to Login
              </Link>
            </div>
          </div>
        )}

        {/* Step 2: Verify OTP */}
        {step === 2 && (
          <div className="p-8 sm:p-10 animate-fade-in-up">
            <div className="text-center mb-8">
              <div className="mx-auto inline-flex items-center justify-center p-3 bg-cyan-50 rounded-2xl mb-5 border border-cyan-100 shadow-sm">
                <ShieldCheck className="h-8 w-8 text-cyan-600" />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Enter OTP</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                We've sent a 6-digit code to <span className="font-semibold text-slate-800">{email}</span>. Please enter it below.
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">6-Digit Code</label>
                <div className="relative rounded-xl shadow-sm">
                  <input
                    type="text"
                    required
                    pattern="[0-9]{6}"
                    maxLength="6"
                    value={otp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setOtp(val);
                    }}
                    className="block w-full text-center text-2xl tracking-[0.5em] font-bold bg-white border border-slate-300 text-slate-900 rounded-xl p-3.5 focus:ring-cyan-500 focus:border-cyan-500 shadow-sm transition-colors"
                    placeholder="------"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.2)] text-base font-bold text-white bg-cyan-600  focus:outline-none transition-all transform hover:-translate-y-0.5"
              >
                Verify Code
                <ArrowRight className="h-5 w-5 ml-2" />
              </button>
            </form>
            
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <button onClick={() => setStep(1)} className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-cyan-600 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Use a different email
              </button>
            </div>
          </div>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <div className="p-8 sm:p-10 animate-fade-in-up">
            <div className="text-center mb-8">
              <div className="mx-auto inline-flex items-center justify-center p-3 bg-pink-50 rounded-2xl mb-5 border border-pink-100 shadow-sm">
                <Lock className="h-8 w-8 text-pink-600" />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Create Password</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Your identity has been verified! Please create a new, strong password.
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">New Password</label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={passwords.new}
                    onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                    className="block w-full pl-10 bg-white border border-slate-300 text-slate-900 rounded-xl p-3.5 focus:ring-pink-500 focus:border-pink-500 shadow-sm transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm New Password</label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                    className="block w-full pl-10 bg-white border border-slate-300 text-slate-900 rounded-xl p-3.5 focus:ring-pink-500 focus:border-pink-500 shadow-sm transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-[0_0_15px_rgba(236,72,153,0.2)] text-base font-bold text-white bg-pink-600  focus:outline-none transition-all transform hover:-translate-y-0.5"
              >
                Reset Password
                <CheckCircle2 className="h-5 w-5 ml-2" />
              </button>
            </form>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="p-10 text-center animate-fade-in-up">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-emerald-100 mb-6 shadow-inner">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">Password Reset!</h2>
            <p className="text-slate-500 mb-8 leading-relaxed">
              Your password has been successfully updated. You can now use your new password to log in.
            </p>
            <Link 
              to="/login"
              className="inline-flex justify-center items-center py-3.5 px-6 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none transition-all w-full"
            >
              Continue to Login
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default ForgotPassword;
