  /**
 * Automatic Tagging System for Stelkbook
 * Specifically designed for Indonesian book titles and descriptions.
 */

export const TAG_DICTIONARY: Record<string, string[]> = {
  'programming': ['programming', 'pemrograman', 'coding', 'koding', 'software development'],
  'javascript': ['javascript', 'js', 'react', 'nextjs', 'vue', 'angular', 'node', 'typescript'],
  'php': ['php', 'laravel', 'codeigniter', 'symfony'],
  'python': ['python', 'django', 'flask', 'data science', 'machine learning', 'ai'],
  'java': ['java', 'spring', 'android', 'kotlin'],
  'web-development': ['html', 'css', 'frontend', 'backend', 'api', 'rest api', 'web', 'website'],
  'database': ['sql', 'mysql', 'postgresql', 'mongodb', 'database', 'basis data', 'nosql'],
  'mobile-development': ['android', 'ios', 'flutter', 'react native', 'mobile'],
  'networking': ['jaringan', 'networking', 'cisco', 'mikrotik', 'tcp/ip', 'router', 'switch'],
  'security': ['keamanan', 'security', 'cyber', 'hacking', 'firewall', 'encryption'],
  'design': ['desain', 'design', 'ui', 'ux', 'figma', 'photoshop', 'illustrator', 'graphic'],
  'science': ['sains', 'ipa', 'biologi', 'fisika', 'kimia', 'alam'],
  'mathematics': ['matematika', 'mtk', 'kalkulus', 'aljabar', 'statistika'],
  'history': ['sejarah', 'history', 'masa lalu', 'peradaban'],
  'economy': ['ekonomi', 'bisnis', 'akuntansi', 'pemasaran', 'manajemen'],
  'religion': ['agama', 'islam', 'kristen', 'katolik', 'hindu', 'buddha', 'kepercayaan'],
  'language': ['bahasa', 'indonesia', 'inggris', 'literasi', 'sastra'],
  'api': ['api', 'rest', 'endpoint', 'json', 'xml', 'interface'],
  'laravel': ['laravel', 'eloquent', 'blade', 'artisan'],
  'react': ['react', 'jsx', 'hooks', 'component'],
  'nextjs': ['nextjs', 'ssr', 'ssg', 'app router'],
};

export const INDONESIAN_STOPWORDS = [
  'dan', 'yang', 'untuk', 'di', 'ke', 'dari', 'dengan', 'pada', 'adalah',
  'itu', 'ini', 'saya', 'kami', 'kita', 'mereka', 'dia', 'anda', 'kamu',
  'dalam', 'akan', 'sudah', 'telah', 'setelah', 'sebelum', 'oleh', 'bagi',
  'serta', 'juga', 'atau', 'namun', 'tetapi', 'karena', 'sehingga', 'jika',
  'kalau', 'maka', 'tentang', 'seperti', 'tersebut', 'secara'
];

/**
 * Get all possible tags from the dictionary (flattened)
 */
export const getAllPossibleTags = (): string[] => {
  const allTags = new Set<string>();
  Object.entries(TAG_DICTIONARY).forEach(([category, keywords]) => {
    allTags.add(category);
    keywords.forEach(kw => allTags.add(kw));
  });
  return Array.from(allTags);
};

/**
 * Generates automatic tags based on title and description
 */
export function generateAutomaticTags(title: string = '', description: string = ''): string[] {
  if (!title && !description) return [];

  // 1. Convert to lowercase and combine
  const combinedText = `${title.toLowerCase()} ${description.toLowerCase()}`;

  // 2. Clean text: remove punctuation and split into words
  const words = combinedText
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => {
      // 8. Ignore words shorter than 3 characters
      // 2. Remove Indonesian stopwords
      return word.length >= 3 && !INDONESIAN_STOPWORDS.includes(word);
    });

  const tagScores: Record<string, number> = {};

  // 4. Match keywords with predefined tag dictionary
  // We check both if the word IS a tag category or IF it's a keyword within a category
  words.forEach(word => {
    // Check categories
    if (TAG_DICTIONARY[word]) {
      tagScores[word] = (tagScores[word] || 0) + 2; // Category matches get higher weight
    }

    // Check keywords
    for (const [tag, keywords] of Object.entries(TAG_DICTIONARY)) {
      if (keywords.includes(word)) {
        tagScores[tag] = (tagScores[tag] || 0) + 1;
        
        // Also add the specific keyword as a tag if it's "important" (in our dictionary)
        if (word !== tag && word.length > 3) {
           tagScores[word] = (tagScores[word] || 0) + 1;
        }
      }
    }
  });

  // 6. Return top relevant tags
  // 7. Limit result to maximum 5 tags
  // 9. Prevent duplicate tags
  return Object.entries(tagScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag]) => tag);
}
