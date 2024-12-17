const CACHE_KEY = 'typero_words'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

let wordList = []

const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const fetchWordList = async () => {
  try {
    const response = await fetch('https://monkeytype.com/languages/english.json')
    if (!response.ok) {
      throw new Error('Failed to fetch words')
    }
    const data = await response.json()
    wordList = data.words
  } catch (error) {
    console.warn('Failed to fetch MonkeyType words:', error)
    // Fallback to basic common words if API fails
    wordList = [
      'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
      'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
      'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
      'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
      'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
      'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
      'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
      'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also'
    ]
  }
}

export const getWords = async () => {
  // Fetch words if we don't have them yet
  if (wordList.length === 0) {
    await fetchWordList()
  }
  
  // Get random words by shuffling the entire array and taking first 50
  return shuffleArray(wordList).slice(0, 50)
}
