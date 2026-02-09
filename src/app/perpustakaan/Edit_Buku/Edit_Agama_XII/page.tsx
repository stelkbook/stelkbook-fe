'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import NotificationEditSuccessful from './NotificationEditSuccessful';
import { useRouter } from 'next/navigation';

function Page() {
    const router = useRouter();
    const [selectedKelas, setSelectedKelas] = useState('X');
    const [penulis, setPenulis] = useState('');
    const [isbn, setIsbn] = useState('');
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [pdfName, setPdfName] = useState<string | null>(null);
    const [showNotification, setShowNotification] = useState(false);

    const handleCoverUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                setCoverImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePdfUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            if (file.type === 'application/pdf') {
                setPdfName(file.name);
            } else {
                alert('Please upload a valid PDF file.');
            }
        }
    };
    
    const handleButtonClick = (button: string) => {
        if (button === 'User') {
            router.push('/profile_perpus');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate a successful edit and trigger the notification
        setShowNotification(true);
        // Hide the notification after 3 seconds
        setTimeout(() => setShowNotification(false), 3000);
    };

    useEffect(() => {
        // Disable scroll on mount
        document.body.style.overflow = 'hidden';

        // Re-enable scroll on unmount (to avoid global impact)
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-8 overflow-y-auto">
            {/* Notification */}
            {showNotification && <NotificationEditSuccessful show={true} />}
            
            {/* Header */}
            <header className="flex justify-between items-center mb-8">
                <Image
                    src="/assets/Class/Stelk_bookTitle.png"
                    alt="Stelkbook"
                    width={165}
                    height={100}
                />
                <div className="flex-grow max-w-md relative">
                    <input
                        type="text"
                        placeholder="Pencarian disini"
                        className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <Image
                            src="/assets/Class/Search_icon.png"
                            alt="Search Icon"
                            width={20}
                            height={20}
                        />
                    </div>
                </div>
                <div className="cursor-pointer" onClick={() => handleButtonClick('User')}>
                    <Image
                        src="/assets/Class/icon_user.png"
                        alt="User Icon"
                        width={45}
                        height={40}
                        className="rounded-full"
                    />
                </div>
            </header>

            {/* Title */}
            <div className="mb-6 flex items-center text-gray-700">
                <p className="text-xl font-semibold font-poppins">Perpus Anda</p>
                <div className="mx-2">
                    <Image
                        src="/assets/Kelas_X/Primary_Direct.png"
                        alt=">"
                        width={10}
                        height={16}
                    />
                </div>
                <p className="text-xl font-semibold font-poppins">Edit Buku</p>
            </div>

            {/* Form */}
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-wrap gap-8">
                        {/* Left Section */}
                        <div className="flex-grow">
                            <div className="mb-4">
                                <label className="block text-gray-700 font-medium mb-2">Judul</label>
                                <input
                                    type="text"
                                    placeholder="(Isi Judul)"
                                    className="w-full border border-gray-300 bg-gray-100 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 font-medium mb-2">Kelas</label>
                                <div className="flex space-x-4">
                                    {['X', 'XI', 'XII', 'NA'].map((kelas) => (
                                        <button
                                            key={kelas}
                                            type="button"
                                            onClick={() => setSelectedKelas(kelas)}
                                            className={`py-2 px-4 text-sm font-semibold border rounded-lg transition ${selectedKelas === kelas
                                                ? 'bg-red text-white border-red-500'
                                                : 'bg-white text-gray-700 border-gray-300'
                                                } focus:outline-none cursor-pointer`}
                                        >
                                            {kelas}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 font-medium mb-2">Penerbit</label>
                                <input
                                    type="text"
                                    placeholder="(Isi Penerbit)"
                                    className="w-full border border-gray-300 bg-gray-100 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 font-medium mb-2">Penulis</label>
                                <input
                                    type="text"
                                    value={penulis}
                                    onChange={(e) => setPenulis(e.target.value)}
                                    placeholder="(Isi Penulis)"
                                    className="w-full border border-gray-300 bg-gray-100 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 font-medium mb-2">ISBN</label>
                                <input
                                    type="text"
                                    value={isbn}
                                    onChange={(e) => setIsbn(e.target.value)}
                                    placeholder="(Isi ISBN)"
                                    className="w-full border border-gray-300 bg-gray-100 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Right Section */}
                        <div className="flex flex-col w-1/3 space-y-4">
                            <div className="relative">
                                <label className="block text-gray-700 font-medium mb-2">Cover Buku</label>
                                <div className="border border-gray-300 rounded-lg p-6 bg-gray-50 relative">
                                    {coverImage ? (
                                        <img
                                            src={coverImage}
                                            alt="Book Cover"
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    ) : (
                                        <p className="text-gray-500">Upload dalam format .jpg/.png</p>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleCoverUpload}
                                        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div className="relative">
                                <label className="block text-gray-700 font-medium mb-2">Isi Buku</label>
                                <div className="border border-gray-300 rounded-lg flex items-center justify-center p-6 bg-gray-50 cursor-pointer">
                                    <Image
                                        src="/assets/Perpustakaan/Format_file.png"
                                        alt="Book Content"
                                        width={48}
                                        height={45}
                                    />
                                    {!pdfName && <p className="text-gray-500 ml-4">Upload dalam format .pdf</p>}
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        onChange={handlePdfUpload}
                                        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    {pdfName && <p className="mt-2 text-gray-700">{pdfName}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-32 bg-red text-white rounded-lg py-2 px-4 font-semibold text-sm hover:bg-red-600 mt-4 mx-auto shadow-md focus:outline-none focus:ring-2 focus:ring-red-300 translate-x-[350px]"
                    >
                        Selesai
                    </button>

                </form>
            </div>
        </div>
    );
}

export default Page;
