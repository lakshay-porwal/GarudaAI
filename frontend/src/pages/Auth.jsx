import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle, Sparkles, Check } from 'lucide-react';
import brandingIllustration from '../assets/garuda_branding_illustration.png';

const Auth = () => {
  const navigate = useNavigate();
  const { user, login, signup, loading } = useAuth();

  // If user is already authenticated, redirect to /chat
  useEffect(() => {
    if (user) {
      navigate('/chat', { replace: true });
    }
  }, [user, navigate]);

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', emailID: '', password: '' });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  
  // Custom Toast State
  const [toast, setToast] = useState(null);

  // Load remembered email on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('garuda_remembered_email');
    if (rememberedEmail) {
      setFormData((prev) => ({ ...prev, emailID: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  // Toast auto-dismissal
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (errors.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: '' }));
    }
  };

  // Password Strength Calculator
  const getPasswordStrength = (password) => {
    if (!password) return { percent: 0, label: '', color: 'bg-zinc-800' };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;

    switch (score) {
      case 1: return { percent: 25, label: 'Weak', color: 'bg-rose-500' };
      case 2: return { percent: 50, label: 'Fair', color: 'bg-amber-500' };
      case 3: return { percent: 75, label: 'Good', color: 'bg-yellow-400' };
      case 4: return { percent: 100, label: 'Strong', color: 'bg-emerald-500' };
      default: return { percent: 0, label: '', color: 'bg-zinc-800' };
    }
  };

  const strength = getPasswordStrength(formData.password);

  const validate = () => {
    const tempErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.emailID) {
      tempErrors.emailID = 'Email is required';
    } else if (!emailRegex.test(formData.emailID)) {
      tempErrors.emailID = 'Invalid email address';
    }

    if (!formData.password) {
      tempErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      if (!formData.name.trim()) {
        tempErrors.name = 'Name is required';
      }
      if (formData.password !== confirmPassword) {
        tempErrors.confirmPassword = 'Passwords do not match';
      }
      if (!termsAccepted) {
        tempErrors.terms = 'You must accept the Terms and Conditions';
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || loading) return;
    setApiError('');

    if (isLogin) {
      const result = await login(formData.emailID, formData.password);
      if (result.success) {
        if (rememberMe) {
          localStorage.setItem('garuda_remembered_email', formData.emailID);
        } else {
          localStorage.removeItem('garuda_remembered_email');
        }
        showToast('Logged in successfully!', 'success');
        navigate('/chat');
      } else {
        setApiError(result.error);
        showToast(result.error || 'Login failed', 'error');
      }
    } else {
      const result = await signup(formData.name, formData.emailID, formData.password);
      if (result.success) {
        showToast('Account created successfully!', 'success');
        navigate('/chat');
      } else {
        setApiError(result.error);
        showToast(result.error || 'Signup failed', 'error');
      }
    }
  };

  const toggleAuthMode = () => {
    setIsLogin((prev) => !prev);
    setFormData({ name: '', emailID: '', password: '' });
    setConfirmPassword('');
    setTermsAccepted(false);
    setErrors({});
    setApiError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };



  const handleSocialLoginPlaceholder = (provider) => {
    showToast(`${provider} login will be available in future releases.`, 'info');
  };

  return (
    <div className="min-h-screen w-screen flex flex-col md:flex-row bg-bg-base text-zinc-100 font-sans overflow-y-auto md:overflow-hidden relative select-none">
      
      {/* Toast Notification Banner */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3.5 rounded-2xl border shadow-2xl transition-all duration-300 animate-pulse ${
          toast.type === 'success' 
            ? 'bg-zinc-900 border-emerald-500/30 text-emerald-300' 
            : toast.type === 'error'
            ? 'bg-zinc-900 border-rose-500/30 text-rose-300'
            : 'bg-zinc-900 border-zinc-700/50 text-zinc-300'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <Sparkles className="w-4 h-4 text-zinc-400 shrink-0" />
          )}
          <span className="text-xs font-semibold tracking-wide leading-tight">{toast.message}</span>
        </div>
      )}

      {/* LEFT SECTION: BRANDING & ARTWORK (Hidden on Mobile) */}
      <div className="hidden md:flex md:w-[50%] lg:w-[55%] flex-col justify-between p-12 bg-linear-to-b from-zinc-950 via-zinc-900/60 to-bg-base border-r border-border-dark/65 relative overflow-hidden select-none">
        {/* Glow Spheres */}
        <div className="absolute -top-36 -left-36 w-80 h-80 rounded-full bg-zinc-900/40 blur-3xl opacity-60" />
        <div className="absolute -bottom-36 -right-20 w-80 h-80 rounded-full bg-zinc-800/10 blur-3xl opacity-40" />

        {/* Top Header */}
        <div className="flex items-center gap-2.5 relative z-10">
          <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-850 flex items-center justify-center font-display font-black text-md text-zinc-100">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-zinc-50 to-zinc-400">G</span>
          </div>
          <span className="font-display font-bold text-md tracking-tight text-zinc-200">Garuda AI</span>
        </div>

        {/* Center Presentation */}
        <div className="my-auto space-y-6 relative z-10 max-w-lg mx-auto w-full">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 font-semibold tracking-wider uppercase">
              <Sparkles className="w-3 h-3 text-zinc-400" />
              <span>Next Gen Intelligence</span>
            </span>
            
            <h1 className="text-3.5xl lg:text-4.5xl font-display font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-50 via-zinc-200 to-zinc-400 leading-tight">
              Your Intelligent AI Companion
            </h1>
            
            <p className="text-zinc-500 text-sm leading-relaxed font-medium">
              Experience advanced conversational intelligence. Garuda AI empowers you to write code, solve complex problems, and secure your ideas with privacy at the core.
            </p>
          </div>

          {/* Glowing Illustration Container */}
          <div className="relative group w-full max-w-[260px] mx-auto my-4 transition-transform duration-500 hover:scale-[1.01]">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-zinc-800/50 to-zinc-900/50 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition duration-1000"></div>
            <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/20 backdrop-blur-md p-1 shadow-2xl">
              <img 
                src={brandingIllustration} 
                alt="Garuda AI Core" 
                className="w-full h-auto object-cover rounded-xl opacity-85 group-hover:opacity-100 transition-all duration-500 pointer-events-none select-none"
              />
            </div>
          </div>
        </div>

        {/* Bottom Feature Checkmarks */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 relative z-10 max-w-lg mx-auto w-full border-t border-zinc-900 pt-6">
          {[
            'Smart Conversations',
            'Fast Responses',
            'Context-Aware AI',
            'Secure & Private'
          ].map((feature, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="w-4.5 h-4.5 rounded-full bg-zinc-900/80 border border-zinc-850 flex items-center justify-center text-zinc-300">
                <Check className="w-3 h-3 text-zinc-400" />
              </div>
              <span className="text-[12px] font-semibold text-zinc-400">{feature}</span>
            </div>
          ))}
        </div>

      </div>

      {/* RIGHT SECTION: FORM CARD */}
      <div className="w-full md:w-[50%] lg:w-[45%] flex flex-col justify-center items-center px-6 py-12 md:px-12 relative overflow-y-auto min-h-screen bg-bg-base">
        {/* Glow Spheres for mobile screen backdrop */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-zinc-900/20 blur-3xl md:hidden" />

        {/* Brand logo for mobile views */}
        <div className="flex md:hidden flex-col items-center mb-8 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-2.5 shadow-lg">
            <span className="font-display font-black text-xl text-zinc-200">G</span>
          </div>
          <span className="font-display font-bold text-lg text-zinc-200">Garuda AI</span>
        </div>

        {/* Glassmorphic Form Card */}
        <div className="w-full max-w-md bg-zinc-950/30 backdrop-blur-xl border border-zinc-900/80 p-8 rounded-3xl shadow-2xl relative z-10 transition-all duration-300">
          
          {/* Headline block */}
          <div className="flex flex-col items-center mb-6 text-center">
            <h2 className="text-xl font-display font-bold tracking-tight text-zinc-100">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="text-zinc-500 text-xs mt-1 leading-normal max-w-[280px]">
              {isLogin ? 'Enter your credentials to access your workspace' : 'Get started with Garuda AI today'}
            </p>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              type="button"
              onClick={() => handleSocialLoginPlaceholder('Google')}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-zinc-850/80 bg-zinc-900/10 hover:bg-zinc-900/40 hover:border-zinc-800 text-[11px] font-semibold text-zinc-400 hover:text-zinc-200 transition-all duration-200 cursor-pointer focus:outline-hidden"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <span>Google</span>
            </button>
            
            <button
              type="button"
              onClick={() => handleSocialLoginPlaceholder('GitHub')}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-zinc-850/80 bg-zinc-900/10 hover:bg-zinc-900/40 hover:border-zinc-800 text-[11px] font-semibold text-zinc-400 hover:text-zinc-200 transition-all duration-200 cursor-pointer focus:outline-hidden"
            >
              <svg className="w-3.5 h-3.5 shrink-0 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              <span>GitHub</span>
            </button>
          </div>

          {/* Visual Divider */}
          <div className="flex items-center gap-3 my-5 select-none">
            <div className="flex-1 h-[1px] bg-zinc-900" />
            <span className="text-[10px] font-bold tracking-wider text-zinc-600 uppercase">Or continue with</span>
            <div className="flex-1 h-[1px] bg-zinc-900" />
          </div>

          {/* Form validation global error */}
          {apiError && (
            <div className="mb-5 flex items-start gap-2.5 p-3 rounded-2xl bg-rose-950/20 border border-rose-900/30 text-rose-300 text-xs leading-normal">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Main Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* NAME FIELD (Sign Up Only) */}
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[11px] font-semibold tracking-wide text-zinc-500 uppercase block" htmlFor="name">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={loading}
                    className={`w-full bg-zinc-900/20 border ${
                      errors.name ? 'border-rose-900/50 focus:border-rose-800' : 'border-zinc-850 focus:border-zinc-700'
                    } rounded-2xl py-2.5 pl-10.5 pr-4 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-hidden transition-all duration-200 disabled:opacity-50`}
                  />
                </div>
                {errors.name && (
                  <p className="text-[10px] text-rose-400 font-semibold tracking-wide mt-1">{errors.name}</p>
                )}
              </div>
            )}

            {/* EMAIL FIELD */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold tracking-wide text-zinc-500 uppercase block" htmlFor="emailID">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  id="emailID"
                  name="emailID"
                  placeholder="name@domain.com"
                  value={formData.emailID}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full bg-zinc-900/20 border ${
                    errors.emailID ? 'border-rose-900/50 focus:border-rose-800' : 'border-zinc-850 focus:border-zinc-700'
                  } rounded-2xl py-2.5 pl-10.5 pr-4 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-hidden transition-all duration-200 disabled:opacity-50`}
                />
              </div>
              {errors.emailID && (
                <p className="text-[10px] text-rose-400 font-semibold tracking-wide mt-1">{errors.emailID}</p>
              )}
            </div>

            {/* PASSWORD FIELD */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-semibold tracking-wide text-zinc-500 uppercase block" htmlFor="password">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full bg-zinc-900/20 border ${
                    errors.password ? 'border-rose-900/50 focus:border-rose-800' : 'border-zinc-850 focus:border-zinc-700'
                  } rounded-2xl py-2.5 pl-10.5 pr-10 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-hidden transition-all duration-200 disabled:opacity-50`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex="-1"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-550 hover:text-zinc-350 focus:outline-hidden cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* PASSWORD STRENGTH METER (Sign Up Only) */}
              {!isLogin && formData.password && (
                <div className="space-y-1.5 pt-1.5">
                  <div className="flex justify-between items-center text-[9px] font-semibold uppercase tracking-wider text-zinc-550">
                    <span>Password Strength</span>
                    <span className={
                      strength.label === 'Strong' ? 'text-emerald-500' : 
                      strength.label === 'Good' ? 'text-yellow-500' : 
                      strength.label === 'Fair' ? 'text-amber-500' : 'text-rose-500'
                    }>{strength.label}</span>
                  </div>
                  {/* Progress segments */}
                  <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden flex gap-0.5">
                    <div className={`h-full flex-1 transition-all duration-300 ${strength.percent >= 25 ? strength.color : 'bg-zinc-900'}`} />
                    <div className={`h-full flex-1 transition-all duration-300 ${strength.percent >= 50 ? strength.color : 'bg-zinc-900'}`} />
                    <div className={`h-full flex-1 transition-all duration-300 ${strength.percent >= 75 ? strength.color : 'bg-zinc-900'}`} />
                    <div className={`h-full flex-1 transition-all duration-300 ${strength.percent >= 100 ? strength.color : 'bg-zinc-900'}`} />
                  </div>
                </div>
              )}
              {errors.password && (
                <p className="text-[10px] text-rose-400 font-semibold tracking-wide mt-1">{errors.password}</p>
              )}
            </div>

            {/* CONFIRM PASSWORD FIELD (Sign Up Only) */}
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[11px] font-semibold tracking-wide text-zinc-500 uppercase block" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    disabled={loading}
                    className={`w-full bg-zinc-900/20 border ${
                      errors.confirmPassword ? 'border-rose-900/50 focus:border-rose-800' : 'border-zinc-850 focus:border-zinc-700'
                    } rounded-2xl py-2.5 pl-10.5 pr-10 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-hidden transition-all duration-200 disabled:opacity-50`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    tabIndex="-1"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-550 hover:text-zinc-350 focus:outline-hidden cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-[10px] text-rose-400 font-semibold tracking-wide mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* CHECKBOX OPTIONS */}
            {isLogin ? (
              /* Remember Me */
              <div className="flex items-center justify-between py-1 select-none">
                <label className="flex items-center gap-2.5 text-xs text-zinc-450 hover:text-zinc-300 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                    className="w-4.5 h-4.5 rounded-md border-zinc-800 bg-zinc-900 text-zinc-100 focus:ring-0 focus:outline-hidden cursor-pointer"
                  />
                  <span className="font-medium">Remember me</span>
                </label>
              </div>
            ) : (
              /* Terms and Conditions */
              <div className="space-y-2 select-none">
                <label className="flex items-start gap-2.5 text-xs text-zinc-450 hover:text-zinc-300 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => {
                      setTermsAccepted(e.target.checked);
                      if (errors.terms) setErrors(prev => ({ ...prev, terms: '' }));
                    }}
                    disabled={loading}
                    className="w-4.5 h-4.5 rounded-md border-zinc-800 bg-zinc-900 text-zinc-100 focus:ring-0 focus:outline-hidden cursor-pointer shrink-0 mt-0.5"
                  />
                  <span className="leading-normal">
                    I agree to the <span className="text-zinc-350 hover:underline">Terms of Service</span> and <span className="text-zinc-350 hover:underline">Privacy Policy</span>
                  </span>
                </label>
                {errors.terms && (
                  <p className="text-[10px] text-rose-400 font-semibold tracking-wide mt-1">{errors.terms}</p>
                )}
              </div>
            )}

            {/* ACTION SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-zinc-100 hover:bg-zinc-50 text-zinc-950 font-bold py-2.5 px-4 rounded-2xl text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-sm focus:outline-hidden active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></span>
                  <span>Authenticating...</span>
                </span>
              ) : (
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
              )}
            </button>
          </form>

          {/* Switch Modes Link */}
          <div className="mt-6 text-center select-none border-t border-zinc-900 pt-5">
            <p className="text-zinc-500 text-xs">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button
                onClick={toggleAuthMode}
                disabled={loading}
                className="ml-1.5 text-zinc-350 hover:text-zinc-100 font-semibold transition-colors cursor-pointer focus:outline-hidden disabled:opacity-50"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Auth;
