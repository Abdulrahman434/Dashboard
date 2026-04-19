import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import svgPaths from "./svg-c7usyrwz2w";
import imgCareInnLogo1 from "figma:asset/1497971121f9fe3238b7a912b02a205098173242.png";
import imgLoginPic from "figma:asset/WhatsApp_Image_2026-04-05_at_10.57.07-2.jpeg";

interface DashboardLoginProps {
  onLogin: (email: string, name: string) => void;
}

export default function DashboardLogin({ onLogin }: DashboardLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      // Extract name from email (before @)
      const name = email.split('@')[0].replace(/[._-]/g, ' ').split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      onLogin(email, name);
    }
  };

  return (
    <div className="relative w-full h-screen bg-white overflow-hidden flex flex-col lg:flex-row" data-name="Dashboard - Login">
      {/* Left Side Panel with Image and Healthcare Redefined */}
      <div className="relative w-full h-48 sm:h-56 md:h-64 lg:w-[38%] lg:h-full shrink-0">
        <div className="absolute inset-0">
          <img 
            alt="Healthcare Redefined" 
            className="w-full h-full object-cover pointer-events-none" 
            src="https://careinn.com/CareInnDashboard/LoginPic.jpg" 
          />
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 sm:px-8 md:px-12 lg:px-16 bg-white relative py-6 lg:py-0 overflow-auto">
        {/* Logo at Top Right */}
        <div className="absolute top-4 right-5 sm:top-6 sm:right-8 lg:top-9 lg:right-16">
          <img 
            alt="CareInn Logo" 
            className="h-10 sm:h-12 lg:h-16 w-auto object-contain" 
            src={imgCareInnLogo1} 
          />
        </div>

        {/* Login Form Container */}
        <div className="w-full max-w-[640px] mt-12 sm:mt-14 lg:mt-0">
          {/* System Title */}
          <div className="mb-6 lg:mb-10">
            <h1 className="font-['Poppins',sans-serif] font-bold text-3xl sm:text-4xl lg:text-5xl text-[#16274D] leading-tight mb-2 lg:mb-3">
              CareInn
            </h1>
            <h2 className="font-['Poppins',sans-serif] text-lg sm:text-xl lg:text-2xl text-[#16274D]">
              System Management Portal
            </h2>
          </div>

          {/* Form Container with Border */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-6 sm:p-8 lg:p-12">
            {/* Welcome Text */}
            <div className="mb-5 lg:mb-8">
              <h3 className="font-['Poppins',sans-serif] text-[#4ebee3] tracking-tight mb-2 lg:mb-3 text-xl sm:text-2xl">
                Welcome!
              </h3>
              <p className="text-[#969696] font-['Poppins',sans-serif]">
                Please login to continue to your account.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 lg:space-y-8">
            {/* Email Input */}
            <div className="relative">
              <div className="relative rounded-lg w-full">
                <div className="absolute border-[#d9d9d9] border-[1.5px] border-solid inset-0 pointer-events-none rounded-lg" />
                <div className="flex flex-row items-center w-full">
                  <div className="box-border flex items-center p-4 w-full">
                    <div className="absolute bg-white box-border flex items-center left-3 px-1 -top-2.5">
                      <p className="font-['Poppins',sans-serif] text-[#9a9a9a]">Email</p>
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent outline-none font-['Poppins',sans-serif] text-[#0f1729] placeholder:text-[#d9d9d9]"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Password Input */}
            <div className="relative">
              <div className="relative rounded-lg w-full">
                <div className="absolute border-[#d9d9d9] border-[1.5px] border-solid inset-0 pointer-events-none rounded-lg" />
                <div className="flex flex-row items-center justify-end w-full">
                  <div className="box-border flex gap-2.5 items-center justify-end p-4 w-full">
                    <div className="absolute bg-white box-border flex items-center left-3 px-1 -top-2.5">
                      <p className="font-['Poppins',sans-serif] text-[#9a9a9a]">Password</p>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="flex-1 bg-transparent outline-none font-['Poppins',sans-serif] text-[#0f1729] placeholder:text-[#d9d9d9]"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="shrink-0 text-[#9a9a9a] hover:text-[#0f1729] transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff size={24} strokeWidth={2} />
                      ) : (
                        <Eye size={24} strokeWidth={2} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Keep Logged In Checkbox */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setKeepLoggedIn(!keepLoggedIn)}
                className="shrink-0 w-[18.406px] h-[18.406px] flex items-center justify-center relative cursor-pointer"
              >
                <svg className="block w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19 19">
                  <g>
                    <path 
                      clipRule="evenodd" 
                      d={svgPaths.p6e98580} 
                      fill={keepLoggedIn ? "#4ebee3" : "#636366"} 
                      fillRule="evenodd" 
                    />
                  </g>
                </svg>
                {keepLoggedIn && (
                  <svg 
                    className="absolute inset-0 w-full h-full pointer-events-none" 
                    fill="none" 
                    viewBox="0 0 19 19"
                  >
                    <path 
                      d="M5 9.5L8 12.5L14 6.5" 
                      stroke="white" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
              <label 
                onClick={() => setKeepLoggedIn(!keepLoggedIn)}
                className="font-['Poppins',sans-serif] text-[#16274D] cursor-pointer select-none"
              >
                Keep me logged in
              </label>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="bg-[#4ebee3] hover:bg-[#3da5ca] w-full rounded-lg transition-all duration-200"
            >
              <div className="flex flex-row items-center justify-center">
                <div className="box-border flex gap-2 items-center justify-center px-8 py-4">
                  <p className="font-['Poppins',sans-serif] text-white">
                    Sign in
                  </p>
                </div>
              </div>
            </button>

            {/* Help Links */}
            <div className="flex flex-col items-center gap-2 w-full">
              <a 
                href="#" 
                className="font-['Poppins',sans-serif] font-normal text-[#4ebee3] hover:text-[#3da5ca] transition-colors underline decoration-solid"
              >
                Forgot Password?
              </a>
              <a 
                href="#" 
                className="font-['Poppins',sans-serif] font-normal text-[#4ebee3] hover:text-[#3da5ca] transition-colors underline decoration-solid"
              >
                Need Help?
              </a>
            </div>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
}