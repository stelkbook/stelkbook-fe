"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useBook } from "@/context/bookContext";
import { getStorageUrl } from '@/helpers/storage';


type WarningModalProps = {
  isVisible: boolean;
  onClose: () => void;
  book: {
    id: number;
    judul: string;
    penerbit: string;
    penulis: string;
    tahun: string;
    ISBN: string;
    cover: string;
  };
};

const WarningModalBuku: React.FC<WarningModalProps> = ({
  isVisible,
  onClose,
  book,
}) => {
  const router = useRouter();
  const { deleteBookKelas7 } = useBook();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteBookKelas7(book.id);
      onClose();
      router.push("/kelasVII_perpus");
    } catch (error) {
      console.error("Gagal menghapus buku:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        {/* Modal Header */}
        <h2 className="text-xl font-semibold text-center mb-4">
          Apakah Anda yakin ingin menghapus buku ini?
        </h2>

        {/* Book Details */}
        <div className="flex items-center gap-4 mb-6">
          {/* Book Cover */}
          <div>
         <Image
                                  src={getStorageUrl(book.cover)}
                                  alt={book.judul}
                                  width={70}
                                  height={100}
                                  className="rounded shadow-md"
                                  priority = {true}
                                style={{width:'auto', height:'auto'}}
                                  onError={(e) => {
                                    e.currentTarget.src = "/assets/default-cover.png";
                                  }}
                                />
          </div>

          {/* Book Metadata */}
          <div className="text-sm">
            <h3 className="font-bold">{book.judul}</h3>
            <ul className="mt-2 space-y-1">
              <li>
                <strong>Penerbit:</strong> {book.penerbit}
              </li>
              <li>
                <strong>Penulis:</strong> {book.penulis}
              </li>
              <li>
                <strong>Tahun:</strong> {book.tahun}
              </li>
              <li>
                <strong>ISBN:</strong> {book.ISBN}
              </li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition flex items-center justify-center min-w-[80px] ${
              isDeleting ? "opacity-75" : ""
            }`}
          >
            {isDeleting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Menghapus...
              </>
            ) : (
              "Ya"
            )}
          </button>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className={`bg-red text-white px-4 py-2 rounded-md hover:bg-red transition ${
              isDeleting ? "opacity-75" : ""
            }`}
          >
            Tidak
          </button>
        </div>
      </div>
    </div>
  );
};

export default WarningModalBuku;