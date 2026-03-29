'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import WarningModal from './WarningForgot';
import { Eye, EyeOff } from 'lucide-react';

const slides = [
  { image: "/assets/Lab komputer.jpg", id: "01" },
  // You can add more slides here
];

function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ nisNik: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    document.body.style.overflow = 'hidden';
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => {
      document.body.style.overflow = 'auto';
      clearInterval(interval);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage('');

    const credentials = {
      teacher: { nisNik: 'guru123', password: '123456789', redirect: '/homepage_guru' },
      perpus: { nisNik: 'perpus123', password: '123456789', redirect: '/perpustakaan' },
      admin: { nisNik: 'admin12345', password: '123456789', redirect: '/admin' },
      siswa: { nisNik: 'siswa123', password: '123456789', redirect: '/homepage' },
    };

    let matched = false;
    Object.values(credentials).forEach((cred) => {
      if (form.nisNik === cred.nisNik && form.password === cred.password) {
        matched = true;

        // Track login history
        try {
            const d = new Date();
            const today = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
            const loginStr = localStorage.getItem('login_history');
            let loginData = loginStr ? JSON.parse(loginStr) : {};
            loginData[today] = (loginData[today] || 0) + 1;
            localStorage.setItem('login_history', JSON.stringify(loginData));
        } catch (e) {
            console.error("Failed saving login history", e);
        }

        router.push(cred.redirect);
      }
    });

    if (!matched) {
      setErrorMessage('Invalid credentials. Please try again.');
    }

    setIsSubmitting(false);
  };

  const handleForgotPasswordClick = () => {
    setShowWarningModal(true);
  };

  const handleCloseWarningModal = () => {
    setShowWarningModal(false);
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Left-side slideshow */}
      <div className="hidden lg:block lg:w-9/12 relative" style={{ height: '100vh' }}>
        {isClient && slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              currentSlide === index ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={slide.image}
              alt={`Slide ${index + 1}`}
              fill
              className="object-cover brightness-75"
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      {/* Right-side login */}
      <div className="flex w-full lg:w-4/12 items-center justify-center p-4 sm:p-8 bg-white lg:min-h-screen">
        <div className="w-full max-w-md p-6 sm:p-8 bg-white rounded-lg">
          <div className="text-center mb-8">
            <Image
              src="/assets/icon/stelkbook-logo.svg"
              alt="StelkBook Logo"
              width={60}
              height={60}
              className="mx-auto mb-4 opacity-90"
              style={{ width: 'auto', height: 'auto' }}
              priority
            />
            <Image
              src="/assets/icon/stelkbook-wordmark.svg"
              alt="Title Text"
              width={180}
              height={45}
              className="mx-auto opacity-60"
              style={{ width: 'auto', height: 'auto' }}
              priority
            />
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <input
                type="text"
                id="nisNik"
                name="nisNik"
                value={form.nisNik}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-200 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-red"
                placeholder="NIS/NIP"
                required
              />
            </div>
            <div className="mb-6 relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-200 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-red pr-10"
                placeholder="Password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errorMessage && (
              <div className="mt-4 text-red-500 text-sm text-center">
                {errorMessage}
              </div>
            )}
            <div>
              <button
                type="submit"
                className="w-full py-3 bg-red text-white font-semibold rounded-md hover:bg-red-600 transition duration-200"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Loading...' : 'Login'}
              </button>
            </div>
          </form>
          <div className="mt-4 text-right">
            <button
              onClick={handleForgotPasswordClick}
              className="text-sm text-red hover:underline cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>

          {/* Powered by section - Mobile */}
          <div className="mt-8 lg:hidden flex justify-center">
            <div className="flex items-center space-x-4">
              <Image src="/assets/PoweredBy.png" alt="Powered by Logo" width={80} height={20} />
              <Image src="/assets/Telkom.schools.png" alt="Telkom Logo" width={80} height={20} />
            </div>
          </div>
        </div>

        {/* Powered by section - Desktop */}
        <div className="absolute bottom-8 w-full text-center hidden lg:flex justify-center items-center space-x-4">
          <Image src="/assets/PoweredBy.png" alt="Powered by Logo" width={80} height={20} />
          <Image src="/assets/Telkom.schools.png" alt="Telkom Logo" width={80} height={20} />
        </div>
      </div>

      {showWarningModal && <WarningModal onClose={handleCloseWarningModal} />}
    </div>
  );
}

export default Login;
