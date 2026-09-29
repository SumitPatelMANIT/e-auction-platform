import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Shield, ArrowRight, ArrowLeft, Gavel, Package, Phone, Calendar, Home, MapPin, CheckCircle2 } from 'lucide-react';
import { useAuction } from '../../context/AuctionContext';

import { apiFetch } from '../../utils/api';

const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    dob: '',
    email: '',
    phone: '',
    role: 'BIDDER',
    address: {
      houseNo: '',
      street: '',
      city: '',
      state: '',
      country: '',
      pin: ''
    },
    password: '',
    confirmPassword: ''
  });
  
  const navigate = useNavigate();
  const { setUserRole, setCurrentUser } = useAuction();

  const totalSteps = 4;

  const handleNext = (e) => {
    e.preventDefault();
    if (currentStep < totalSteps) {
      setCurrentStep(curr => curr + 1);
    } else {
      submitRegistration();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(curr => curr - 1);
    }
  };

  const submitRegistration = async () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    
    try {
      const payload = {
        first_name: formData.firstName,
        middle_name: formData.middleName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        dob: formData.dob ? new Date(formData.dob).toISOString() : null,
        phone: formData.phone,
        house_no: formData.address.houseNo,
        street: formData.address.street,
        city: formData.address.city,
        state: formData.address.state,
        country: formData.address.country,
        pin_code: formData.address.pin,
      };

      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      // Save token and set context
      localStorage.setItem('token', data.token);
      setCurrentUser({
        id: data.user_id,
        name: `${data.first_name} ${data.last_name}`,
        role: data.role,
        email: data.email,
        phone: data.phone,
        dob: data.dob,
        photoUrl: data.photoUrl,
        address: {
          houseNo: data.house_no,
          street: data.street,
          city: data.city,
          state: data.state,
          country: data.country,
          pin: data.pin_code,
        }
      });

      // Show success summary screen
      setIsSubmitted(true);
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center animate-fade-in-up py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden text-center p-10 sm:p-16">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-emerald-100 mb-8 shadow-inner">
            <CheckCircle2 className="h-12 w-12 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Registration Successful!</h2>
          <p className="text-lg text-slate-500 mb-8">Your account has been created securely.</p>
          
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 text-left mb-8 space-y-4">
            <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">Registration Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-slate-500 mb-1">Name</span>
                <span className="font-semibold text-slate-900">{formData.firstName} {formData.middleName} {formData.lastName}</span>
              </div>
              <div>
                <span className="block text-slate-500 mb-1">Role</span>
                <span className="font-semibold text-teal-600">{formData.role}</span>
              </div>
              <div>
                <span className="block text-slate-500 mb-1">Email</span>
                <span className="font-semibold text-slate-900">{formData.email}</span>
              </div>
              <div>
                <span className="block text-slate-500 mb-1">Phone</span>
                <span className="font-semibold text-slate-900">{formData.phone}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="block text-slate-500 mb-1">Address</span>
                <span className="font-semibold text-slate-900">
                  {formData.address.houseNo}, {formData.address.street}, {formData.address.city}, {formData.address.state}, {formData.address.country} - {formData.address.pin}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              navigate('/');
              setTimeout(() => {
                const el = document.getElementById('roles');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="inline-flex justify-center items-center py-4 px-8 border border-transparent rounded-xl shadow-[0_0_20px_rgba(13,148,136,0.3)] text-base font-bold text-white bg-teal-600  focus:outline-none transition-all transform hover:-translate-y-1 w-full sm:w-auto"
          >
            Go to Login
            <ArrowRight className="h-5 w-5 ml-2" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center animate-fade-in-up py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        
        {/* Header & Stepper */}
        <div className="bg-slate-900 p-8 sm:p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
          <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
          
          <div className="relative z-10 text-center mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight mb-2">Create Your Account</h2>
            <p className="text-teal-200">Join the premium e-auction ecosystem</p>
          </div>

          {/* Stepper */}
          <div className="relative z-10 flex justify-between items-center max-w-md mx-auto">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex flex-col items-center relative z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${
                  currentStep === step 
                    ? 'bg-teal-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.5)] scale-110' 
                    : currentStep > step 
                      ? 'bg-emerald-400 text-slate-900' 
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {currentStep > step ? <CheckCircle2 className="h-5 w-5" /> : step}
                </div>
              </div>
            ))}
            {/* Connecting Lines */}
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-slate-800 -z-10">
              <div 
                className="h-full bg-teal-500 transition-all duration-500"
                style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="flex justify-between items-center max-w-md mx-auto mt-3 text-xs font-medium text-slate-400">
            <span className={currentStep >= 1 ? 'text-teal-200' : ''}>Role</span>
            <span className={currentStep >= 2 ? 'text-teal-200' : ''}>Personal</span>
            <span className={currentStep >= 3 ? 'text-teal-200' : ''}>Address</span>
            <span className={currentStep >= 4 ? 'text-teal-200' : ''}>Security</span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-8 sm:p-10">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-semibold text-center">
              {error}
            </div>
          )}
          <form onSubmit={handleNext}>
            
            {/* Step 1: Role */}
            {currentStep === 1 && (
              <div className="animate-fade-in-up">
                <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">How do you want to use the platform?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg mx-auto">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: 'BIDDER'})}
                    className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 transition-all ${
                      formData.role === 'BIDDER' 
                        ? 'border-teal-600 bg-teal-50/50 shadow-md ring-4 ring-teal-50' 
                        : 'border-slate-200 bg-white hover:border-teal-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-4 rounded-full mb-4 ${formData.role === 'BIDDER' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <Gavel className="h-8 w-8" />
                    </div>
                    <span className={`font-bold text-lg ${formData.role === 'BIDDER' ? 'text-teal-900' : 'text-slate-700'}`}>I am a Bidder</span>
                    <span className="text-sm text-slate-500 text-center mt-2">I want to bid on and purchase exclusive items.</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: 'SELLER'})}
                    className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 transition-all ${
                      formData.role === 'SELLER' 
                        ? 'border-teal-600 bg-teal-50/50 shadow-md ring-4 ring-teal-50' 
                        : 'border-slate-200 bg-white hover:border-teal-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-4 rounded-full mb-4 ${formData.role === 'SELLER' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <Package className="h-8 w-8" />
                    </div>
                    <span className={`font-bold text-lg ${formData.role === 'SELLER' ? 'text-teal-900' : 'text-slate-700'}`}>I am a Seller</span>
                    <span className="text-sm text-slate-500 text-center mt-2">I want to list and sell my valuable assets.</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Personal & Contact */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in-up">
                <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-200 pb-2">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-1">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">First Name *</label>
                    <input type="text" required value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="block w-full bg-white border border-slate-300 text-slate-900 rounded-xl p-3 focus:ring-teal-500 focus:border-teal-500 shadow-sm" placeholder="John" />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Middle Name</label>
                    <input type="text" value={formData.middleName} onChange={(e) => setFormData({...formData, middleName: e.target.value})} className="block w-full bg-white border border-slate-300 text-slate-900 rounded-xl p-3 focus:ring-teal-500 focus:border-teal-500 shadow-sm" placeholder="Optional" />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Last Name *</label>
                    <input type="text" required value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="block w-full bg-white border border-slate-300 text-slate-900 rounded-xl p-3 focus:ring-teal-500 focus:border-teal-500 shadow-sm" placeholder="Doe" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date of Birth *</label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-slate-400" />
                      </div>
                      <input type="date" required value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} className="block w-full pl-10 bg-white border border-slate-300 text-slate-900 rounded-xl p-3 focus:ring-teal-500 focus:border-teal-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number *</label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-slate-400" />
                      </div>
                      <input 
                        type="tel" 
                        required 
                        pattern="[0-9]{10}"
                        maxLength="10"
                        title="Please enter exactly 10 digits"
                        value={formData.phone} 
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (val.length <= 10) {
                            setFormData({...formData, phone: val});
                          }
                        }} 
                        className="block w-full pl-10 bg-white border border-slate-300 text-slate-900 rounded-xl p-3 focus:ring-teal-500 focus:border-teal-500" 
                        placeholder="1234567890" 
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address *</label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="block w-full pl-10 bg-white border border-slate-300 text-slate-900 rounded-xl p-3 focus:ring-teal-500 focus:border-teal-500" placeholder="you@example.com" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Address */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in-up">
                <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-200 pb-2">Address Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-1">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">House/Apt No. *</label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Home className="h-5 w-5 text-slate-400" />
                      </div>
                      <input type="text" required value={formData.address.houseNo} onChange={(e) => setFormData({...formData, address: {...formData.address, houseNo: e.target.value}})} className="block w-full pl-10 bg-white border border-slate-300 text-slate-900 rounded-xl p-3 focus:ring-teal-500 focus:border-teal-500" placeholder="123A" />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Street Name *</label>
                    <input type="text" required value={formData.address.street} onChange={(e) => setFormData({...formData, address: {...formData.address, street: e.target.value}})} className="block w-full bg-white border border-slate-300 text-slate-900 rounded-xl p-3 focus:ring-teal-500 focus:border-teal-500 shadow-sm" placeholder="Main Street" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">City *</label>
                    <input type="text" required value={formData.address.city} onChange={(e) => setFormData({...formData, address: {...formData.address, city: e.target.value}})} className="block w-full bg-white border border-slate-300 text-slate-900 rounded-xl p-3 focus:ring-teal-500 focus:border-teal-500 shadow-sm" placeholder="New York" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">State/Province *</label>
                    <input type="text" required value={formData.address.state} onChange={(e) => setFormData({...formData, address: {...formData.address, state: e.target.value}})} className="block w-full bg-white border border-slate-300 text-slate-900 rounded-xl p-3 focus:ring-teal-500 focus:border-teal-500 shadow-sm" placeholder="NY" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Country *</label>
                    <input type="text" required value={formData.address.country} onChange={(e) => setFormData({...formData, address: {...formData.address, country: e.target.value}})} className="block w-full bg-white border border-slate-300 text-slate-900 rounded-xl p-3 focus:ring-teal-500 focus:border-teal-500 shadow-sm" placeholder="United States" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">PIN / Zip Code *</label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-slate-400" />
                      </div>
                      <input 
                        type="text" 
                        required 
                        pattern="[0-9]{6}"
                        maxLength="6"
                        title="Please enter exactly 6 digits"
                        value={formData.address.pin} 
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (val.length <= 6) {
                            setFormData({...formData, address: {...formData.address, pin: val}});
                          }
                        }} 
                        className="block w-full pl-10 bg-white border border-slate-300 text-slate-900 rounded-xl p-3 focus:ring-teal-500 focus:border-teal-500" 
                        placeholder="123456" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Security */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-fade-in-up">
                <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-200 pb-2">Account Security</h3>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Create Password *</label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input type="password" required minLength="8" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="block w-full pl-10 bg-white border border-slate-300 text-slate-900 rounded-xl p-3 focus:ring-teal-500 focus:border-teal-500" placeholder="At least 8 characters" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password *</label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Shield className="h-5 w-5 text-slate-400" />
                    </div>
                    <input type="password" required minLength="8" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} className={`block w-full pl-10 bg-white border text-slate-900 rounded-xl p-3 focus:ring-teal-500 focus:border-teal-500 ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : 'border-slate-300'}`} placeholder="Confirm your password" />
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="mt-2 text-sm text-rose-500 font-medium">Passwords do not match.</p>
                  )}
                </div>

                <div className="bg-teal-50 p-4 rounded-xl border border-teal-100 flex items-start mt-6">
                  <Shield className="h-5 w-5 text-teal-600 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-sm text-teal-800">
                    By clicking complete registration, you agree to our Terms of Service and Privacy Policy. Your data is encrypted and stored securely.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-10 flex items-center justify-between pt-6 border-t border-slate-200">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center px-5 py-2.5 border border-slate-300 shadow-sm text-sm font-bold rounded-xl text-slate-700 bg-white hover:bg-slate-50 focus:outline-none transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </button>
              ) : (
                <div /> // Spacer
              )}

              <button
                type="submit"
                className="inline-flex justify-center items-center py-3 px-8 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-teal-600  focus:outline-none transition-all transform hover:-translate-y-0.5"
              >
                {currentStep < totalSteps ? (
                  <>
                    Next Step
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  <>
                    Complete Registration
                    <CheckCircle2 className="h-4 w-4 ml-2" />
                  </>
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/#roles" onClick={(e) => {
                e.preventDefault();
                navigate('/');
                setTimeout(() => {
                  const el = document.getElementById('roles');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }} className="font-bold text-teal-600 hover:text-teal-500 transition-colors">
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
