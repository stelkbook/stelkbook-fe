export const getAllPossibleTags = (): string[] => {
  return [
    // Mata Pelajaran Umum
    'Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'IPA', 'IPS', 'PPKn', 'PJOK', 'Seni Budaya', 'Prakarya', 'Agama',
    // Sains
    'Fisika', 'Kimia', 'Biologi', 'Sains', 'Alam',
    // Sosial
    'Sejarah', 'Geografi', 'Ekonomi', 'Sosiologi', 'Antropologi',
    // Jenjang
    'SD', 'SMP', 'SMA', 'SMK', 'Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6',
    'Kelas 7', 'Kelas 8', 'Kelas 9', 'Kelas 10', 'Kelas 11', 'Kelas 12',
    // Topik Khusus
    'Pemrograman', 'Desain', 'Bisnis', 'Keuangan', 'Kesehatan', 'Teknologi', 'Sastra', 'Novel', 'Komik',
    // Lainnya
    'Buku Paket', 'LKS', 'Modul', 'Referensi', 'Ensiklopedia'
  ].sort();
};

export const generateAutomaticTags = (title: string, description: string): string[] => {
  const tags: Set<string> = new Set();
  const text = `${title} ${description}`.toLowerCase();

  const keywords: Record<string, string[]> = {
    'Matematika': ['matematika', 'math', 'kalkulus', 'aljabar', 'geometri', 'statistika'],
    'Bahasa Indonesia': ['bahasa indonesia', 'sastra indonesia', 'puisi', 'prosa'],
    'Bahasa Inggris': ['bahasa inggris', 'english', 'grammar', 'vocabulary'],
    'IPA': ['ipa', 'sains', 'alam', 'biologi', 'fisika', 'kimia'],
    'IPS': ['ips', 'sosial', 'sejarah', 'geografi', 'ekonomi'],
    'PPKn': ['ppkn', 'pkn', 'pancasila', 'kewarganegaraan'],
    'PJOK': ['pjok', 'penjas', 'olahraga', 'kesehatan'],
    'Seni Budaya': ['seni', 'budaya', 'musik', 'tari', 'rupa', 'teater'],
    'Agama': ['agama', 'islam', 'kristen', 'katolik', 'hindu', 'buddha', 'konghucu', 'paibp'],
    'Fisika': ['fisika', 'physics', 'mekanika', 'termodinamika'],
    'Kimia': ['kimia', 'chemistry', 'atom', 'molekul'],
    'Biologi': ['biologi', 'biology', 'sel', 'genetika'],
    'Sejarah': ['sejarah', 'history', 'masa lampau'],
    'Geografi': ['geografi', 'geography', 'bumi', 'peta'],
    'Ekonomi': ['ekonomi', 'economy', 'akuntansi', 'manajemen'],
    'Sosiologi': ['sosiologi', 'sociology', 'masyarakat'],
    'SD': ['sd', 'sekolah dasar', 'madrasah ibtidaiyah'],
    'SMP': ['smp', 'sekolah menengah pertama', 'madrasah tsanawiyah'],
    'SMA': ['sma', 'sekolah menengah atas', 'madrasah aliyah'],
    'SMK': ['smk', 'sekolah menengah kejuruan'],
    'Kelas 1': ['kelas 1', 'kelas i ', 'grade 1'],
    'Kelas 2': ['kelas 2', 'kelas ii ', 'grade 2'],
    'Kelas 3': ['kelas 3', 'kelas iii ', 'grade 3'],
    'Kelas 4': ['kelas 4', 'kelas iv ', 'grade 4'],
    'Kelas 5': ['kelas 5', 'kelas v ', 'grade 5'],
    'Kelas 6': ['kelas 6', 'kelas vi ', 'grade 6'],
    'Kelas 7': ['kelas 7', 'kelas vii ', 'grade 7'],
    'Kelas 8': ['kelas 8', 'kelas viii ', 'grade 8'],
    'Kelas 9': ['kelas 9', 'kelas ix ', 'grade 9'],
    'Kelas 10': ['kelas 10', 'kelas x ', 'grade 10'],
    'Kelas 11': ['kelas 11', 'kelas xi ', 'grade 11'],
    'Kelas 12': ['kelas 12', 'kelas xii ', 'grade 12'],
  };

  for (const [tag, keywordList] of Object.entries(keywords)) {
    if (keywordList.some(k => text.includes(k))) {
      tags.add(tag);
    }
  }

  return Array.from(tags);
};
