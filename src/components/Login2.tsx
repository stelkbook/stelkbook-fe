'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/authContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import WarningModal from './WarningForgot';
import { Eye, EyeOff } from 'lucide-react';

const slides = [
    { image: "/assets/login/4.png", id: "04" },
    { image: "/assets/login/2.png", id: "02" },
    { image: "/assets/login/7.png", id: "07" },
    { image: "/assets/login/3.png", id: "03" },
    { image: "/assets/login/5.png", id: "05" },
    { image: "/assets/login/1.png", id: "01" },
    { image: "/assets/login/8.png", id: "08" },
    { image: "/assets/login/perpus.png", id: "09" },
];

function Login() {
    const { login } = useAuth();
    const router = useRouter();
    const [form, setForm] = useState({ kode: '', password: '' });
    const [errorMessage, setErrorMessage] = useState('');
    const [kodeError, setKodeError] = useState('');
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        
        return () => clearInterval(interval);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isSubmitting) return;
        setErrorMessage('');
        setIsSubmitting(true);
        try {
            const user = await login(form);
            const role = user.role.toLowerCase();

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

            switch (role) {
                case 'admin':
                case 'perpus':
                case 'pengurusperpustakaan':
                    router.push('/perpustakaan');
                    break;
                case 'guru':
                    router.push('/homepage_guru');
                    break;
                case 'siswa':
                default:
                    router.push('/homepage');
                    break;
            }
        } catch (error) {
            setErrorMessage('Login gagal. Periksa kembali kode atau password.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRegistrasiClick = () => {
        router.push('/registrasi');
    };

    const handleCloseWarningModal = () => {
        setShowWarningModal(false);
    };

    return (
        <>
            {/* Main container - full viewport height & width */}
            <div className="flex h-screen w-screen fixed top-0 left-0 flex-col lg:flex-row overflow-hidden">
                {/* Left-side slideshow - Desktop full height */}
                <div className="hidden lg:block lg:w-8/12 h-full relative overflow-hidden">
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
                                className="object-cover"
                                priority={index === 0}
                                sizes="(max-width: 1024px) 100vw, 66vw"
                                quality={75}
                            />
                        </div>
                    ))}
                </div>

                {/* Mobile & Tablet Background Image - Full screen */}
                <div className="lg:hidden absolute inset-0 w-full h-full overflow-hidden">
                    <Image
                        src="/assets/login/4.png"
                        alt="Mobile Background"
                        fill
                        className="object-cover"
                        priority
                        sizes="100vw"
                        quality={75}
                    />
                    <div className="absolute inset-0 bg-black/40" />
                </div>

                {/* Right-side login - Full height dengan centering sempurna */}
                <div className="flex w-full lg:w-4/12 h-full items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    <div className="w-full max-w-md mx-auto">
                        <div className="w-full p-6 sm:p-8 bg-white/95 lg:bg-white rounded-2xl lg:rounded-lg shadow-2xl lg:shadow-xl backdrop-blur-sm lg:backdrop-blur-none">
                            
                            {/* Logo Section */}
                            <div className="text-center mb-8">
                                <div className="flex justify-center mb-4">
                                    <Image
                                        src="/assets/icon/stelkbook-logo.svg"
                                        alt="StelkBook Logo"
                                        width={200}
                                        height={200}
                                        className="opacity-90"
                                        priority
                                        style={{ width: 'auto', height: 'auto' }}
                                    />
                                </div>
                                <Image
                                    src="/assets/icon/stelkbook-wordmark.svg"
                                    alt="Title Text"
                                    width={250}
                                    height={50}
                                    className="mx-auto opacity-60"
                                    priority
                                    style={{ width: 'auto', height: 'auto' }}
                                />
                            </div>

                            {/* Form Section */}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <input
                                        type="text"
                                        id="kode"
                                        name="kode"
                                        value={form.kode}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 bg-gray-100 text-gray-900 rounded-lg focus:outline-none focus:ring-2 ${
                                            kodeError ? 'ring-2 ring-red-500' : 'focus:ring-red focus:ring-2'
                                        }`}
                                        placeholder="NIS / NIP"
                                        required
                                        autoComplete="username"
                                    />
                                    {kodeError && (
                                        <p className="mt-2 text-red-500 text-sm">
                                            {kodeError}
                                        </p>
                                    )}
                                </div>
                                
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-100 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-red pr-12"
                                        placeholder="Password"
                                        required
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>

                                {errorMessage && (
                                    <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
                                        {errorMessage}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="w-full py-3 bg-red text-white font-semibold rounded-lg hover:bg-red-700 transition duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Loading...
                                        </span>
                                    ) : 'Login'}
                                </button>
                            </form>

                            {/* Registrasi Link */}
                            <div className="mt-6 text-right">
                                <button
                                    onClick={handleRegistrasiClick}
                                    className="text-sm text-red hover:text-red-700 font-medium hover:underline transition duration-200"
                                >
                                    Registrasi?
                                </button>
                            </div>

                            {/* Powered by Section - Mobile & Tablet */}
                            <div className="mt-8 lg:hidden flex justify-center items-center space-x-4 pt-4 border-t border-gray-200">
                                <div className="flex items-center space-x-3">
                                    <Image 
                                        src="/assets/PoweredBy.png" 
                                        alt="Powered by" 
                                        width={70} 
                                        height={18}
                                        className="opacity-80"
                                        style={{ width: 'auto', height: 'auto' }}
                                    />
                                    <span className="text-gray-400">•</span>
                                    <Image 
                                        src="/assets/Telkom.schools.png" 
                                        alt="Telkom Schools" 
                                        width={80} 
                                        height={20}
                                        className="opacity-80"
                                        style={{ width: 'auto', height: 'auto' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Powered by Section - Desktop */}
                <div className="hidden lg:flex absolute bottom-8 left-8 items-center space-x-4 z-20">
                    <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                        <div className="flex items-center space-x-3">
                            <Image 
                                src="/assets/PoweredBy.png" 
                                alt="Powered by" 
                                width={70} 
                                height={18}
                                style={{ width: 'auto', height: 'auto' }}
                            />
                            <span className="text-gray-500">•</span>
                            <Image 
                                src="/assets/Telkom.schools.png" 
                                alt="Telkom Schools" 
                                width={80} 
                                height={20}
                                style={{ width: 'auto', height: 'auto' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Warning Modal */}
                {showWarningModal && <WarningModal onClose={handleCloseWarningModal} />}
            </div>
        </>
    );
}

export default Login;