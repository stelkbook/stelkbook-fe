'use client'
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from '../utils/axios'; // Pastikan path ini sesuai dengan struktur proyek Anda


const BookContext = createContext();

export const BookProvider = ({ children }) => {
    const [books, setBooks] = useState([]);
    const [siswaBooks, setSiswaBooks] = useState([]);
    const [guruBooks, setGuruBooks] = useState([]);
    const [perpusBooks, setPerpusBooks] = useState([]);
    const [nonAkademikBooks, setNonAkademikBooks] = useState([]);
    const [kelas1Books, setKelas1Books] = useState([]);
    const [kelas2Books, setKelas2Books] = useState([]);
    const [kelas3Books, setKelas3Books] = useState([]);
    const [kelas4Books, setKelas4Books] = useState([]);
    const [kelas5Books, setKelas5Books] = useState([]);
    const [kelas6Books, setKelas6Books] = useState([]);
    const [kelas7Books, setKelas7Books] = useState([]);
    const [kelas8Books, setKelas8Books] = useState([]);
    const [kelas9Books, setKelas9Books] = useState([]);
    const [kelas10Books, setKelas10Books] = useState([]);
    const [kelas11Books, setKelas11Books] = useState([]);   
    const [kelas12Books, setKelas12Books] = useState([]);

    const paginationInitialState = {
        currentPage: 1,
        lastPage: 1,
        total: 0
    };

    const [kelas1Pagination, setKelas1Pagination] = useState(paginationInitialState);
    const [kelas2Pagination, setKelas2Pagination] = useState(paginationInitialState);
    const [kelas3Pagination, setKelas3Pagination] = useState(paginationInitialState);
    const [kelas4Pagination, setKelas4Pagination] = useState(paginationInitialState);
    const [kelas5Pagination, setKelas5Pagination] = useState(paginationInitialState);
    const [kelas6Pagination, setKelas6Pagination] = useState(paginationInitialState);
    const [kelas7Pagination, setKelas7Pagination] = useState(paginationInitialState);
    const [kelas8Pagination, setKelas8Pagination] = useState(paginationInitialState);
    const [kelas9Pagination, setKelas9Pagination] = useState(paginationInitialState);
    const [kelas10Pagination, setKelas10Pagination] = useState(paginationInitialState);
    const [kelas11Pagination, setKelas11Pagination] = useState(paginationInitialState);
    const [kelas12Pagination, setKelas12Pagination] = useState(paginationInitialState);
    const [nonAkademikPagination, setNonAkademikPagination] = useState(paginationInitialState);
    const [guruPagination, setGuruPagination] = useState(paginationInitialState);
    const [rekapKunjunganBooks, setRekapKunjunganBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        lastPage: 1,
        total: 0
    });

    // Fungsi untuk mengambil semua buku
    const fetchBooks = useCallback(async (page = 1) => {
        setLoading(true);
        try {
          const res = await axios.get(`/books?page=${page}`);
          // Handle paginated response
          const { data, current_page, last_page, total } = res.data.books;
          
          setBooks(data);

          setPagination({
              currentPage: current_page,
              lastPage: last_page,
              total: total
          });
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      }, []); // Stabil

    // Fungsi untuk mengambil buku siswa
    const fetchSiswaBooks = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/books-siswa');
            setSiswaBooks(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchKelas1Books = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = await axios.get(`/books-kelas-1?page=${page}`);
            let data = response.data;
            let paginationMeta = {
                currentPage: 1,
                lastPage: 1,
                total: 0
            };

            if (data.books && data.books.data) {
                paginationMeta = {
                    currentPage: data.books.current_page,
                    lastPage: data.books.last_page,
                    total: data.books.total
                };
                data = data.books.data;
            } else if (data.data && data.current_page) {
                paginationMeta = {
                    currentPage: data.current_page,
                    lastPage: data.last_page,
                    total: data.total
                };
                data = data.data;
            } else if (Array.isArray(data)) {
                const perPage = 8;
                paginationMeta.total = data.length;
                paginationMeta.lastPage = Math.ceil(data.length / perPage);
                paginationMeta.currentPage = Number(page);
                
                const start = (Number(page) - 1) * perPage;
                const end = start + perPage;
                data = data.slice(start, end);
            }

            setKelas1Books(data);
            setKelas1Pagination(paginationMeta);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    },[])

    const fetchKelas2Books = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = await axios.get(`/books-kelas-2?page=${page}`);
            let data = response.data;
            let paginationMeta = {
                currentPage: 1,
                lastPage: 1,
                total: 0
            };

            if (data.books && data.books.data) {
                paginationMeta = {
                    currentPage: data.books.current_page,
                    lastPage: data.books.last_page,
                    total: data.books.total
                };
                data = data.books.data;
            } else if (data.data && data.current_page) {
                paginationMeta = {
                    currentPage: data.current_page,
                    lastPage: data.last_page,
                    total: data.total
                };
                data = data.data;
            } else if (Array.isArray(data)) {
                const perPage = 8;
                paginationMeta.total = data.length;
                paginationMeta.lastPage = Math.ceil(data.length / perPage);
                paginationMeta.currentPage = Number(page);
                
                const start = (Number(page) - 1) * perPage;
                const end = start + perPage;
                data = data.slice(start, end);
            }

            setKelas2Books(data);
            setKelas2Pagination(paginationMeta);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    },[])
    const fetchKelas3Books = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = await axios.get(`/books-kelas-3?page=${page}`);
            let data = response.data;
            let paginationMeta = {
                currentPage: 1,
                lastPage: 1,
                total: 0
            };

            if (data.books && data.books.data) {
                paginationMeta = {
                    currentPage: data.books.current_page,
                    lastPage: data.books.last_page,
                    total: data.books.total
                };
                data = data.books.data;
            } else if (data.data && data.current_page) {
                paginationMeta = {
                    currentPage: data.current_page,
                    lastPage: data.last_page,
                    total: data.total
                };
                data = data.data;
            } else if (Array.isArray(data)) {
                const perPage = 8;
                paginationMeta.total = data.length;
                paginationMeta.lastPage = Math.ceil(data.length / perPage);
                paginationMeta.currentPage = Number(page);
                
                const start = (Number(page) - 1) * perPage;
                const end = start + perPage;
                data = data.slice(start, end);
            }

            setKelas3Books(data);
            setKelas3Pagination(paginationMeta);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    },[])

    const fetchKelas4Books = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = await axios.get(`/books-kelas-4?page=${page}`);
            let data = response.data;
            let paginationMeta = {
                currentPage: 1,
                lastPage: 1,
                total: 0
            };

            if (data.books && data.books.data) {
                paginationMeta = {
                    currentPage: data.books.current_page,
                    lastPage: data.books.last_page,
                    total: data.books.total
                };
                data = data.books.data;
            } else if (data.data && data.current_page) {
                paginationMeta = {
                    currentPage: data.current_page,
                    lastPage: data.last_page,
                    total: data.total
                };
                data = data.data;
            } else if (Array.isArray(data)) {
                const perPage = 8;
                paginationMeta.total = data.length;
                paginationMeta.lastPage = Math.ceil(data.length / perPage);
                paginationMeta.currentPage = Number(page);
                
                const start = (Number(page) - 1) * perPage;
                const end = start + perPage;
                data = data.slice(start, end);
            }

            setKelas4Books(data);
            setKelas4Pagination(paginationMeta);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    },[])
    const fetchKelas5Books = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = await axios.get(`/books-kelas-5?page=${page}`);
            let data = response.data;
            let paginationMeta = {
                currentPage: 1,
                lastPage: 1,
                total: 0
            };

            if (data.books && data.books.data) {
                paginationMeta = {
                    currentPage: data.books.current_page,
                    lastPage: data.books.last_page,
                    total: data.books.total
                };
                data = data.books.data;
            } else if (data.data && data.current_page) {
                paginationMeta = {
                    currentPage: data.current_page,
                    lastPage: data.last_page,
                    total: data.total
                };
                data = data.data;
            } else if (Array.isArray(data)) {
                const perPage = 8;
                paginationMeta.total = data.length;
                paginationMeta.lastPage = Math.ceil(data.length / perPage);
                paginationMeta.currentPage = Number(page);
                
                const start = (Number(page) - 1) * perPage;
                const end = start + perPage;
                data = data.slice(start, end);
            }

            setKelas5Books(data);
            setKelas5Pagination(paginationMeta);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    },[])

    const fetchKelas6Books = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = await axios.get(`/books-kelas-6?page=${page}`);
            let data = response.data;
            let paginationMeta = {
                currentPage: 1,
                lastPage: 1,
                total: 0
            };

            if (data.books && data.books.data) {
                paginationMeta = {
                    currentPage: data.books.current_page,
                    lastPage: data.books.last_page,
                    total: data.books.total
                };
                data = data.books.data;
            } else if (data.data && data.current_page) {
                paginationMeta = {
                    currentPage: data.current_page,
                    lastPage: data.last_page,
                    total: data.total
                };
                data = data.data;
            } else if (Array.isArray(data)) {
                const perPage = 8;
                paginationMeta.total = data.length;
                paginationMeta.lastPage = Math.ceil(data.length / perPage);
                paginationMeta.currentPage = Number(page);
                
                const start = (Number(page) - 1) * perPage;
                const end = start + perPage;
                data = data.slice(start, end);
            }

            setKelas6Books(data);
            setKelas6Pagination(paginationMeta);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    },[])
    const fetchKelas7Books = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = await axios.get(`/books-kelas-7?page=${page}`);
            let data = response.data;
            let paginationMeta = {
                currentPage: 1,
                lastPage: 1,
                total: 0
            };

            if (data.books && data.books.data) {
                paginationMeta = {
                    currentPage: data.books.current_page,
                    lastPage: data.books.last_page,
                    total: data.books.total
                };
                data = data.books.data;
            } else if (data.data && data.current_page) {
                paginationMeta = {
                    currentPage: data.current_page,
                    lastPage: data.last_page,
                    total: data.total
                };
                data = data.data;
            } else if (Array.isArray(data)) {
                const perPage = 8;
                paginationMeta.total = data.length;
                paginationMeta.lastPage = Math.ceil(data.length / perPage);
                paginationMeta.currentPage = Number(page);
                
                const start = (Number(page) - 1) * perPage;
                const end = start + perPage;
                data = data.slice(start, end);
            }

            setKelas7Books(data);
            setKelas7Pagination(paginationMeta);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    },[])

    const fetchKelas8Books = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = await axios.get(`/books-kelas-8?page=${page}`);
            let data = response.data;
            let paginationMeta = {
                currentPage: 1,
                lastPage: 1,
                total: 0
            };

            if (data.books && data.books.data) {
                paginationMeta = {
                    currentPage: data.books.current_page,
                    lastPage: data.books.last_page,
                    total: data.books.total
                };
                data = data.books.data;
            } else if (data.data && data.current_page) {
                paginationMeta = {
                    currentPage: data.current_page,
                    lastPage: data.last_page,
                    total: data.total
                };
                data = data.data;
            } else if (Array.isArray(data)) {
                const perPage = 8;
                paginationMeta.total = data.length;
                paginationMeta.lastPage = Math.ceil(data.length / perPage);
                paginationMeta.currentPage = Number(page);
                
                const start = (Number(page) - 1) * perPage;
                const end = start + perPage;
                data = data.slice(start, end);
            }

            setKelas8Books(data);
            setKelas8Pagination(paginationMeta);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    },[])
    const fetchKelas9Books = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = await axios.get(`/books-kelas-9?page=${page}`);
            let data = response.data;
            let paginationMeta = {
                currentPage: 1,
                lastPage: 1,
                total: 0
            };

            if (data.books && data.books.data) {
                paginationMeta = {
                    currentPage: data.books.current_page,
                    lastPage: data.books.last_page,
                    total: data.books.total
                };
                data = data.books.data;
            } else if (data.data && data.current_page) {
                paginationMeta = {
                    currentPage: data.current_page,
                    lastPage: data.last_page,
                    total: data.total
                };
                data = data.data;
            } else if (Array.isArray(data)) {
                const perPage = 8;
                paginationMeta.total = data.length;
                paginationMeta.lastPage = Math.ceil(data.length / perPage);
                paginationMeta.currentPage = Number(page);
                
                const start = (Number(page) - 1) * perPage;
                const end = start + perPage;
                data = data.slice(start, end);
            }

            setKelas9Books(data);
            setKelas9Pagination(paginationMeta);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    },[])
    const fetchKelas10Books = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = await axios.get(`/books-kelas-10?page=${page}`);
            let data = response.data;
            let paginationMeta = {
                currentPage: 1,
                lastPage: 1,
                total: 0
            };

            if (data.books && data.books.data) {
                paginationMeta = {
                    currentPage: data.books.current_page,
                    lastPage: data.books.last_page,
                    total: data.books.total
                };
                data = data.books.data;
            } else if (data.data && data.current_page) {
                paginationMeta = {
                    currentPage: data.current_page,
                    lastPage: data.last_page,
                    total: data.total
                };
                data = data.data;
            } else if (Array.isArray(data)) {
                const perPage = 8;
                paginationMeta.total = data.length;
                paginationMeta.lastPage = Math.ceil(data.length / perPage);
                paginationMeta.currentPage = Number(page);
                
                const start = (Number(page) - 1) * perPage;
                const end = start + perPage;
                data = data.slice(start, end);
            }

            setKelas10Books(data);
            setKelas10Pagination(paginationMeta);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    },[])
    const fetchKelas11Books = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = await axios.get(`/books-kelas-11?page=${page}`);
            let data = response.data;
            let paginationMeta = {
                currentPage: 1,
                lastPage: 1,
                total: 0
            };

            if (data.books && data.books.data) {
                paginationMeta = {
                    currentPage: data.books.current_page,
                    lastPage: data.books.last_page,
                    total: data.books.total
                };
                data = data.books.data;
            } else if (data.data && data.current_page) {
                paginationMeta = {
                    currentPage: data.current_page,
                    lastPage: data.last_page,
                    total: data.total
                };
                data = data.data;
            } else if (Array.isArray(data)) {
                const perPage = 8;
                paginationMeta.total = data.length;
                paginationMeta.lastPage = Math.ceil(data.length / perPage);
                paginationMeta.currentPage = Number(page);
                
                const start = (Number(page) - 1) * perPage;
                const end = start + perPage;
                data = data.slice(start, end);
            }

            setKelas11Books(data);
            setKelas11Pagination(paginationMeta);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    },[])
    const fetchKelas12Books = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = await axios.get(`/books-kelas-12?page=${page}`);
            
            // Check for pagination structure
            let data = response.data;
            let paginationMeta = {
                currentPage: 1,
                lastPage: 1,
                total: 0
            };

            // Handle different possible response structures
            if (data.books && data.books.data) {
                // Structure similar to fetchBooks
                paginationMeta = {
                    currentPage: data.books.current_page,
                    lastPage: data.books.last_page,
                    total: data.books.total
                };
                data = data.books.data;
            } else if (data.data && data.current_page) {
                // Direct pagination structure
                paginationMeta = {
                    currentPage: data.current_page,
                    lastPage: data.last_page,
                    total: data.total
                };
                data = data.data;
            } else if (Array.isArray(data)) {
                // Fallback for array response with Client-Side Pagination
                const perPage = 8; // Adjust this value based on your grid layout
                paginationMeta.total = data.length;
                paginationMeta.lastPage = Math.ceil(data.length / perPage);
                paginationMeta.currentPage = Number(page);
                
                // Perform client-side slicing
                const start = (Number(page) - 1) * perPage;
                const end = start + perPage;
                data = data.slice(start, end);
            }

            setKelas12Books(data);
            setKelas12Pagination(paginationMeta);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    },[])

    // Fungsi untuk mengambil buku guru
    const fetchGuruBooks = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = await axios.get(`/books-guru?page=${page}`);
            let data = response.data;
            let paginationMeta = {
                currentPage: 1,
                lastPage: 1,
                total: 0
            };

            if (data.books && data.books.data) {
                paginationMeta = {
                    currentPage: data.books.current_page,
                    lastPage: data.books.last_page,
                    total: data.books.total
                };
                data = data.books.data;
            } else if (data.data && data.current_page) {
                paginationMeta = {
                    currentPage: data.current_page,
                    lastPage: data.last_page,
                    total: data.total
                };
                data = data.data;
            } else if (Array.isArray(data)) {
                const perPage = 8;
                paginationMeta.total = data.length;
                paginationMeta.lastPage = Math.ceil(data.length / perPage);
                paginationMeta.currentPage = Number(page);
                
                const start = (Number(page) - 1) * perPage;
                const end = start + perPage;
                data = data.slice(start, end);
            }

            setGuruBooks(data);
            setGuruPagination(paginationMeta);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    },[])

    // Fungsi untuk mengambil buku perpus
    const fetchPerpusBooks = useCallback(async () => {
        setLoading(true);
        try {
          const response = await axios.get('/books-perpus');
        //   console.log('Response from API:', response.data); // Debugging
          setPerpusBooks(response.data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      }, []);

     

    // Fungsi untuk mengambil buku non akademik
    const fetchNonAkademikBooks = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = await axios.get(`/books-non-akademik?page=${page}`);
            let data = response.data;
            let paginationMeta = {
                currentPage: 1,
                lastPage: 1,
                total: 0
            };

            if (data.books && data.books.data) {
                paginationMeta = {
                    currentPage: data.books.current_page,
                    lastPage: data.books.last_page,
                    total: data.books.total
                };
                data = data.books.data;
            } else if (data.data && data.current_page) {
                paginationMeta = {
                    currentPage: data.current_page,
                    lastPage: data.last_page,
                    total: data.total
                };
                data = data.data;
            } else if (Array.isArray(data)) {
                const perPage = 8;
                paginationMeta.total = data.length;
                paginationMeta.lastPage = Math.ceil(data.length / perPage);
                paginationMeta.currentPage = Number(page);
                
                const start = (Number(page) - 1) * perPage;
                const end = start + perPage;
                data = data.slice(start, end);
            }

            const mappedData = data.map(b => ({
                ...b,
                cover: b.cover_image || b.cover,
                isi: b.file_pdf || b.isi,
                tahun: b.tahun_terbit || b.tahun,
            }));
            setNonAkademikBooks(mappedData);
            setNonAkademikPagination(paginationMeta);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    },[])

    const fetchBookById = useCallback(async (id) => {
        setLoading(true);
        try {
            const response = await axios.get(`/books/${id}`);
            const data = response.data;
            return {
                ...data,
                cover: data.cover_image || data.cover,
                isi: data.file_pdf || data.isi,
                tahun: data.tahun_terbit || data.tahun,
            };
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    },[]);
    

    // Fungsi untuk mengambil dan menampilkan file PDF

      
    

    // Fungsi untuk mengambil buku siswa berdasarkan ID
    const fetchSiswaBookById = async (id) => {
        setLoading(true);
        try {
            const response = await axios.get(`/books/siswa/${id}`);
            return response.data;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fungsi untuk mengambil buku guru berdasarkan ID
    const fetchGuruBookById = useCallback(async (id) => {
        setLoading(true);
        try {
            const response = await axios.get(`/books/guru/${id}`);
            return response.data;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    },[])

    // Fungsi untuk mengambil buku perpus berdasarkan ID
    const fetchPerpusBookById = useCallback(async (id) => {
        setLoading(true);
        try {
            const response = await axios.get(`/books-perpus/${id}`);
            return response.data;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    });

    // Tambahkan fungsi refreshNonAkademikBooks
const refreshNonAkademikBooks = useCallback(async () => {
    setLoading(true);
    try {
        const response = await axios.get('/books-non-akademik');
        const mappedData = response.data.map(b => ({
            ...b,
            cover: b.cover_image || b.cover,
            isi: b.file_pdf || b.isi,
            tahun: b.tahun_terbit || b.tahun,
        }));
        setNonAkademikBooks(mappedData);
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
}, []);

const fetchKelas1BookById = useCallback(async (id) => {
    setLoading(true);
    try {
        const response = await axios.get(`/books-kelas-1/${id}`);
        return response.data;
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
},[]);
const fetchKelas2BookById = useCallback(async (id) => {
    setLoading(true);
    try {
        const response = await axios.get(`/books-kelas-2/${id}`);
        return response.data;
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
},[]);

const fetchKelas3BookById = useCallback(async (id) => {
    setLoading(true);
    try {
        const response = await axios.get(`/books-kelas-3/${id}`);
        return response.data;
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
},[]);
const fetchKelas4BookById = useCallback(async (id) => {
    setLoading(true);
    try {
        const response = await axios.get(`/books-kelas-4/${id}`);
        return response.data;
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
},[]);
const fetchKelas5BookById = useCallback(async (id) => {
    setLoading(true);
    try {
        const response = await axios.get(`/books-kelas-5/${id}`);
        return response.data;
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
},[]);
const fetchKelas6BookById = useCallback(async (id) => {
    setLoading(true);
    try {
        const response = await axios.get(`/books-kelas-6/${id}`);
        return response.data;
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
},[]);
const fetchKelas7BookById = useCallback(async (id) => {
    setLoading(true);
    try {
        const response = await axios.get(`/books-kelas-7/${id}`);
        return response.data;
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
},[]);
const fetchKelas8BookById = useCallback(async (id) => {
    setLoading(true);
    try {
        const response = await axios.get(`/books-kelas-8/${id}`);
        return response.data;
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
},[]);
const fetchKelas9BookById = useCallback(async (id) => {
    setLoading(true);
    try {
        const response = await axios.get(`/books-kelas-9/${id}`);
        return response.data;
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
},[]);
const fetchKelas10BookById = useCallback(async (id) => {
    setLoading(true);
    try {
        const response = await axios.get(`/books-kelas-10/${id}`);
        return response.data;
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
},[]);
const fetchKelas11BookById = useCallback(async (id) => {
    setLoading(true);
    try {
        const response = await axios.get(`/books-kelas-11/${id}`);
        return response.data;
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
},[]);
const fetchKelas12BookById = useCallback(async (id) => {
    setLoading(true);
    try {
        const response = await axios.get(`/books-kelas-12/${id}`);
        return response.data;
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
},[]);

// Perbaiki fetchNonAkademikBookById
const fetchNonAkademikBookById = useCallback(async (id) => {
    setLoading(true);
    try {
        const response = await axios.get(`/books/non-akademik/${id}`);
        return response.data;
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
}, []);

    // Fungsi untuk mengambil buku non akademik berdasarkan ID

    // Fungsi untuk menambahkan buku baru
    const addBook = async (bookData) => {
        setLoading(true);
        try {
            const response = await axios.post('/books', bookData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            // Update books state with the new book data (structure based on backend response: { data: { ... } })
            setBooks((prevBooks) => [response.data.book, ...prevBooks]);
            return response.data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Fungsi untuk memperbarui buku
    const updateBook = async (id, bookData) => {
        setLoading(true);
        try {
            const response = await axios.post(`/books/${id}`, bookData, { params: { _method: 'PUT' },
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setBooks((prevBooks) =>
                prevBooks.map((book) =>
                    book.id === id ? response.data.book : book
                )
            );
            return response.data;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    const updateKelas1Book = async (id, bookData) => {
        setLoading(true);
        try {
            const response = await axios.post(`/books-kelas-1/${id}`, bookData, { params: { _method: 'PUT' },
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setBooks((prevBooks) =>
                prevBooks.map((book) =>
                    book.id === id ? response.data.book : book
                )
            );
            return response.data;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const updateKelas2Book = async (id, bookData) => {
        setLoading(true);
        try {
            const response = await axios.post(`/books-kelas-2/${id}`, bookData, { params: { _method: 'PUT' },
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setBooks((prevBooks) =>
                prevBooks.map((book) =>
                    book.id === id ? response.data.book : book
                )
            );
            return response.data;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    const updateKelas3Book = async (id, bookData) => {
        setLoading(true);
        try {
            const response = await axios.post(`/books-kelas-3/${id}`, bookData, { params: { _method: 'PUT' },
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setBooks((prevBooks) =>
                prevBooks.map((book) =>
                    book.id === id ? response.data.book : book
                )
            );
            return response.data;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const updateKelas4Book = async (id, bookData) => {
        setLoading(true);
        try {
            const response = await axios.post(`/books-kelas-4/${id}`, bookData, { params: { _method: 'PUT' },
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setBooks((prevBooks) =>
                prevBooks.map((book) =>
                    book.id === id ? response.data.book : book
                )
            );
            return response.data;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    const updateKelas5Book = async (id, bookData) => {
        setLoading(true);
        try {
            const response = await axios.post(`/books-kelas-5/${id}`, bookData, { params: { _method: 'PUT' },
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setBooks((prevBooks) =>
                prevBooks.map((book) =>
                    book.id === id ? response.data.book : book
                )
            );
            return response.data;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    const updateKelas6Book = async (id, bookData) => {
        setLoading(true);
        try {
            const response = await axios.post(`/books-kelas-6/${id}`, bookData, { params: { _method: 'PUT' },
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setBooks((prevBooks) =>
                prevBooks.map((book) =>
                    book.id === id ? response.data.book : book
                )
            );
            return response.data;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    const updateKelas7Book = async (id, bookData) => {
        setLoading(true);
        try {
            const response = await axios.post(`/books-kelas-7/${id}`, bookData, { params: { _method: 'PUT' },
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setBooks((prevBooks) =>
                prevBooks.map((book) =>
                    book.id === id ? response.data.book : book
                )
            );
            return response.data;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    const updateKelas8Book = async (id, bookData) => {
        setLoading(true);
        try {
            const response = await axios.post(`/books-kelas-8/${id}`, bookData, { params: { _method: 'PUT' },
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setBooks((prevBooks) =>
                prevBooks.map((book) =>
                    book.id === id ? response.data.book : book
                )
            );
            return response.data;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    const updateKelas9Book = async (id, bookData) => {
        setLoading(true);
        try {
            const response = await axios.post(`/books-kelas-9/${id}`, bookData, { params: { _method: 'PUT' },
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setBooks((prevBooks) =>
                prevBooks.map((book) =>
                    book.id === id ? response.data.book : book
                )
            );
            return response.data;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    const updateKelas10Book = async (id, bookData) => {
        setLoading(true);
        try {
            const response = await axios.post(`/books-kelas-10/${id}`, bookData, { params: { _method: 'PUT' },
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setBooks((prevBooks) =>
                prevBooks.map((book) =>
                    book.id === id ? response.data.book : book
                )
            );
            return response.data;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    const updateKelas11Book = async (id, bookData) => {
        setLoading(true);
        try {
            const response = await axios.post(`/books-kelas-11/${id}`, bookData, { params: { _method: 'PUT' },
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setBooks((prevBooks) =>
                prevBooks.map((book) =>
                    book.id === id ? response.data.book : book
                )
            );
            return response.data;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    const updateKelas12Book = async (id, bookData) => {
        setLoading(true);
        try {
            const response = await axios.post(`/books-kelas-12/${id}`, bookData, { params: { _method: 'PUT' },
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setBooks((prevBooks) =>
                prevBooks.map((book) =>
                    book.id === id ? response.data.book : book
                )
            );
            return response.data;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    const updateNonAkademikBook = async (id, bookData) => {
        setLoading(true);
        try {
            const response = await axios.post(`/books-non-akademik/${id}`, bookData, { params: { _method: 'PUT' },
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setBooks((prevBooks) =>
                prevBooks.map((book) =>
                    book.id === id ? response.data.book : book
                )
            );
            return response.data;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fungsi untuk menghapus buku
    const deleteBook = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`/books/${id}`);
            setBooks((prevBooks) => prevBooks.filter((book) => book.id !== id));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fungsi untuk menghapus buku non-akademik
const deleteBookNonAkademik = async (id) => {
    setLoading(true);
    try {
        await axios.delete(`/books-non-akademik/${id}`);
        setNonAkademikBooks((prevBooks) => prevBooks.filter((book) => book.id !== id));
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
};
const deleteBookKelas1 = async (id) => {
    setLoading(true);
    try {
        await axios.delete(`/books-kelas-1/${id}`);
        setNonAkademikBooks((prevBooks) => prevBooks.filter((book) => book.id !== id));
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
};

const deleteBookKelas2 = async (id) => {
    setLoading(true);
    try {
        await axios.delete(`/books-kelas-2/${id}`);
        setNonAkademikBooks((prevBooks) => prevBooks.filter((book) => book.id !== id));
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
};

const deleteBookKelas3 = async (id) => {
    setLoading(true);
    try {
        await axios.delete(`/books-kelas-3/${id}`);
        setNonAkademikBooks((prevBooks) => prevBooks.filter((book) => book.id !== id));
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
};

const deleteBookKelas4 = async (id) => {
    setLoading(true);
    try {
        await axios.delete(`/books-kelas-4/${id}`);
        setNonAkademikBooks((prevBooks) => prevBooks.filter((book) => book.id !== id));
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
};
const deleteBookKelas5 = async (id) => {
    setLoading(true);
    try {
        await axios.delete(`/books-kelas-5/${id}`);
        setNonAkademikBooks((prevBooks) => prevBooks.filter((book) => book.id !== id));
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
};

const deleteBookKelas6 = async (id) => {
    setLoading(true);
    try {
        await axios.delete(`/books-kelas-6/${id}`);
        setNonAkademikBooks((prevBooks) => prevBooks.filter((book) => book.id !== id));
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
};
const deleteBookKelas7 = async (id) => {
    setLoading(true);
    try {
        await axios.delete(`/books-kelas-7/${id}`);
        setNonAkademikBooks((prevBooks) => prevBooks.filter((book) => book.id !== id));
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
};

const deleteBookKelas8 = async (id) => {
    setLoading(true);
    try {
        await axios.delete(`/books-kelas-8/${id}`);
        setNonAkademikBooks((prevBooks) => prevBooks.filter((book) => book.id !== id));
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
};
const deleteBookKelas9 = async (id) => {
    setLoading(true);
    try {
        await axios.delete(`/books-kelas-9/${id}`);
        setNonAkademikBooks((prevBooks) => prevBooks.filter((book) => book.id !== id));
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
};

const deleteBookKelas10 = async (id) => {
    setLoading(true);
    try {
        await axios.delete(`/books-kelas-10/${id}`);
        setNonAkademikBooks((prevBooks) => prevBooks.filter((book) => book.id !== id));
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
};
const deleteBookKelas11 = async (id) => {
    setLoading(true);
    try {
        await axios.delete(`/books-kelas-11/${id}`);
        setNonAkademikBooks((prevBooks) => prevBooks.filter((book) => book.id !== id));
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
};

const deleteBookKelas12 = async (id) => {
    setLoading(true);
    try {
        await axios.delete(`/books-kelas-12/${id}`);
        setNonAkademikBooks((prevBooks) => prevBooks.filter((book) => book.id !== id));
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
};

 const fetchRekapKunjunganBooks = useCallback(async () => {
    // Silent fetch - don't trigger global loading or error for this secondary data
    try {
      const response = await axios.get('/rekap-kunjungan-books');
      if (response.data && response.data.data) {
          setRekapKunjunganBooks(response.data.data); 
      }
    } catch (err) {
      console.error('Failed to fetch rekap kunjungan:', err);
      // Suppress global error to avoid blocking UI for secondary data
    } 
  }, []);


    // Ambil data buku saat komponen pertama kali di-mount
    useEffect(() => {
        // fetchBooks();
        // fetchSiswaBooks();
        // fetchGuruBooks();
        // fetchPerpusBooks();
        // fetchNonAkademikBooks();
        // fetchKelas1Books();
        // fetchKelas2Books();
        // fetchKelas3Books();
        // fetchKelas4Books();
        // fetchKelas5Books();
        // fetchKelas6Books();
        // fetchKelas7Books();
        // fetchKelas8Books();
        // fetchKelas9Books();
        // fetchKelas10Books();
        // fetchKelas11Books();
        // fetchKelas12Books();
        // fetchRekapKunjunganBooks();
    }, []);

    return (
        <BookContext.Provider
            value={{
                books,
                siswaBooks,
                guruBooks,
                perpusBooks,
                nonAkademikBooks,
                kelas1Books,
                kelas2Books,
                kelas3Books,
                kelas4Books,
                kelas5Books,
                kelas6Books,
                kelas7Books,
                kelas8Books,
                kelas9Books,
                kelas10Books,
                kelas11Books,
                kelas12Books,
                kelas1Pagination,
                kelas2Pagination,
                kelas3Pagination,
                kelas4Pagination,
                kelas5Pagination,
                kelas6Pagination,
                kelas7Pagination,
                kelas8Pagination,
                kelas9Pagination,
                kelas10Pagination,
                kelas11Pagination,
                kelas12Pagination,
                nonAkademikPagination,
                guruPagination,
                pagination,
                loading,
                error,
                fetchBooks,
                fetchRekapKunjunganBooks,
                rekapKunjunganBooks,
                fetchSiswaBooks,
                fetchKelas1Books,
                fetchKelas2Books,
                fetchKelas3Books,
                fetchKelas4Books,
                fetchKelas5Books,
                fetchKelas6Books,
                fetchKelas7Books,
                fetchKelas8Books,
                fetchKelas9Books,
                fetchKelas10Books,
                fetchKelas11Books,
                fetchKelas12Books,
                fetchGuruBooks,
                fetchPerpusBooks,
                fetchNonAkademikBooks,
                fetchSiswaBookById,
                fetchKelas1BookById,
                fetchKelas2BookById,
                fetchKelas3BookById,
                fetchKelas4BookById,
                fetchKelas5BookById,
                fetchKelas6BookById,
                fetchKelas7BookById,
                fetchKelas8BookById,
                fetchKelas9BookById,
                fetchKelas10BookById,
                fetchKelas11BookById,
                fetchKelas12BookById,
                fetchGuruBookById,
                fetchPerpusBookById,
                fetchNonAkademikBookById,
                fetchBookById,
                addBook,
                updateBook,
                updateKelas1Book,
                updateKelas2Book,
                updateKelas3Book,
                updateKelas4Book,
                updateKelas5Book,
                updateKelas6Book,
                updateKelas7Book,
                updateKelas8Book,
                updateKelas9Book,
                updateKelas10Book,
                updateKelas11Book,
                updateKelas12Book,
                updateNonAkademikBook,
                deleteBook,
                deleteBookKelas1,
                deleteBookKelas2,
                deleteBookKelas3,
                deleteBookKelas4,
                deleteBookKelas5,
                deleteBookKelas6,
                deleteBookKelas7,
                deleteBookKelas8,
                deleteBookKelas9,
                deleteBookKelas10,
                deleteBookKelas11,
                deleteBookKelas12,
                deleteBookNonAkademik,
                refreshNonAkademikBooks
            }}
        >
            {children}
        </BookContext.Provider>
    );
};

export const useBook = () => useContext(BookContext);
