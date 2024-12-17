import { useState, useRef, useEffect } from 'react'
import {
  Box,
  Container,
  Text,
  Button,
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  useColorModeValue,
  Flex,
  Heading
} from '@chakra-ui/react'
import { getWords } from './services/wordService'

const TIME_MODES = {
  TIME_15: { label: '15s', value: 15, seconds: 15 },
  TIME_30: { label: '30s', value: 30, seconds: 30 },
  TIME_60: { label: '60s', value: 60, seconds: 60 },
}

function App() {
  const [words, setWords] = useState([])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentInput, setCurrentInput] = useState('')
  const [startTime, setStartTime] = useState(null)
  const [timeLeft, setTimeLeft] = useState(null)
  const [isFinished, setIsFinished] = useState(false)
  const [wordStates, setWordStates] = useState([])
  const [timeMode, setTimeMode] = useState(TIME_MODES.TIME_30)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(0)
  const [score, setScore] = useState(0)
  const [showResults, setShowResults] = useState(false)

  const inputRef = useRef(null)

  useEffect(() => {
    initializeTest()
  }, [])

  useEffect(() => {
    let interval
    if (startTime && !isFinished && timeLeft > 0) {
      interval = setInterval(() => {
        const elapsedTime = (Date.now() - startTime) / 1000
        const newTimeLeft = Math.max(0, timeMode.seconds - Math.floor(elapsedTime))
        setTimeLeft(newTimeLeft)
        
        const stats = calculateStats()
        setWpm(stats.wpm)
        setAccuracy(stats.accuracy)
        
        if (newTimeLeft === 0) {
          clearInterval(interval)
          setIsFinished(true)
          const finalStats = calculateStats()
          calculateScore(finalStats.wpm, finalStats.accuracy)
        }
      }, 200)
    }
    return () => clearInterval(interval)
  }, [startTime, isFinished, timeMode])

  const initializeTest = async () => {
    const newWords = await getWords()
    setWords(newWords)
    setCurrentWordIndex(0)
    setCurrentInput('')
    setStartTime(null)
    setTimeLeft(timeMode.seconds)
    setWordStates(newWords.map(() => ({ status: 'pending', characters: [] })))
    setWpm(0)
    setAccuracy(0)
    setScore(0)
    setShowResults(false)
    setIsFinished(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (isFinished) return

    if (!startTime && e.key !== 'Tab') {
      setStartTime(Date.now())
      setTimeLeft(timeMode.seconds)
    }

    if (e.key === ' ') {
      e.preventDefault()
      const trimmedInput = currentInput.trim()
      if (trimmedInput.length > 0) {
        checkWord()
      }
    } else if (e.key === 'Backspace') {
      if (currentInput === '' && currentWordIndex > 0) {
        e.preventDefault()
        const newStates = [...wordStates]
        newStates[currentWordIndex - 1] = { status: 'pending', characters: [] }
        setWordStates(newStates)
        setCurrentWordIndex(currentWordIndex - 1)
        setCurrentInput(words[currentWordIndex - 1])
      }
    }
  }

  const handleInput = (e) => {
    if (isFinished) return
    if (!startTime) {
      setStartTime(Date.now())
      setTimeLeft(timeMode.seconds)
    }
    const value = e.target.value
    const lastChar = value[value.length - 1]
    
    if (lastChar !== ' ') {
      setCurrentInput(value)
      updateCurrentWordState(value)
    }
  }

  const updateCurrentWordState = (input) => {
    const currentWord = words[currentWordIndex]
    const newStates = [...wordStates]
    const characterStates = []

    for (let i = 0; i < Math.max(input.length, currentWord.length); i++) {
      if (i >= input.length) {
        characterStates.push('pending')
      } else if (i >= currentWord.length) {
        characterStates.push('incorrect')
      } else {
        characterStates.push(input[i] === currentWord[i] ? 'correct' : 'incorrect')
      }
    }

    newStates[currentWordIndex] = {
      status: 'current',
      characters: characterStates
    }
    setWordStates(newStates)
  }

  const checkWord = () => {
    const currentWord = words[currentWordIndex]
    const isCorrect = currentInput === currentWord
    const newStates = [...wordStates]
    newStates[currentWordIndex] = {
      status: isCorrect ? 'correct' : 'incorrect',
      characters: newStates[currentWordIndex].characters
    }
    setWordStates(newStates)
    setCurrentWordIndex(currentWordIndex + 1)
    setCurrentInput('')
  }

  const calculateStats = () => {
    if (!startTime || timeLeft === timeMode.seconds) return { wpm: 0, accuracy: 0 }
    
    const elapsedMinutes = (Date.now() - startTime) / 1000 / 60
    const typedWords = Object.values(wordStates).filter(
      state => state?.status === 'correct' || state?.status === 'incorrect'
    ).length

    const correctWords = Object.values(wordStates).filter(
      state => state?.status === 'correct'
    ).length

    const currentWpm = Math.round(typedWords / elapsedMinutes) || 0
    const currentAccuracy = typedWords > 0 ? Math.round((correctWords / typedWords) * 100) : 0

    return { wpm: currentWpm, accuracy: currentAccuracy }
  }

  const calculateScore = (finalWpm, finalAccuracy) => {
    // Base score from WPM
    const wpmScore = finalWpm * 10 // 10 points per WPM
    
    // Accuracy multiplier (0.5 to 1.5)
    const accuracyMultiplier = Math.max(0.5, 1 + ((finalAccuracy - 50) / 100))
    
    // Calculate final score
    const finalScore = Math.round(wpmScore * accuracyMultiplier)
    
    // Update all final stats
    setWpm(finalWpm)
    setAccuracy(finalAccuracy)
    setScore(finalScore)
    setShowResults(true)
  }

  const handleReset = () => {
    setWords([])
    setCurrentWordIndex(0)
    setCurrentInput('')
    setStartTime(0)
    setTimeLeft(timeMode.seconds)
    setWpm(0)
    setAccuracy(0)
    setWordStates({})
    setScore(0)
    setShowResults(false)
    setIsFinished(false)
    initializeTest()
  }

  const Word = ({ word, active, typed, state }) => {
    const letters = word.split('')
    const typedLetters = typed ? typed.split('') : []
    const isCompleted = state?.status === 'correct' || state?.status === 'incorrect'

    return (
      <HStack spacing={0} position="relative">
        {letters.map((letter, i) => (
          <Text
            key={i}
            color={
              active
                ? i < typedLetters.length
                  ? typedLetters[i] === letter
                    ? 'green.400'
                    : 'red.400'
                  : 'gray.500'
                : state?.status === 'correct'
                ? 'green.400'
                : state?.status === 'incorrect'
                ? 'red.400'
                : 'gray.500'
            }
            fontSize="xl"
          >
            {letter}
          </Text>
        ))}
        {active && (
          <Box
            position="absolute"
            left={`${(typed ? typed.length : 0) * 0.61}em`}
            height="1.2em"
            width="1px"
            bg="gray.400"
            animation="blink 1s infinite"
            sx={{
              '@keyframes blink': {
                '0%': { opacity: 1 },
                '50%': { opacity: 0 },
                '100%': { opacity: 1 },
              },
            }}
          />
        )}
      </HStack>
    )
  }

  const WORDS_PER_LINE = 12
  const VISIBLE_LINES = 3

  const getVisibleWords = () => {
    const currentLine = Math.floor(currentWordIndex / WORDS_PER_LINE)
    // Always show current line in the middle (second row)
    const startLine = Math.max(0, currentLine - 1)
    const startIndex = startLine * WORDS_PER_LINE
    const endIndex = Math.min(words.length, startIndex + (WORDS_PER_LINE * VISIBLE_LINES))
    return words.slice(startIndex, endIndex)
  }

  const bgColor = useColorModeValue('gray.100', 'gray.900')
  const wordBgColor = useColorModeValue('gray.200', 'gray.800')
  const borderColor = useColorModeValue('gray.300', 'gray.700')

  return (
    <Box minH="100vh" bg={bgColor} py={10}>
      <Container maxW="4xl">
        <VStack spacing={8}>
          <Heading>TypeRo</Heading>
          
          {showResults ? (
            <VStack spacing={6} p={8} bg={wordBgColor} borderRadius="lg" w="full">
              <Heading size="lg">Time's Up!</Heading>
              <StatGroup w="full">
                <Stat>
                  <StatLabel>Final Score</StatLabel>
                  <StatNumber color="green.400" fontSize="4xl">{score}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>WPM</StatLabel>
                  <StatNumber>{wpm}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Accuracy</StatLabel>
                  <StatNumber>{accuracy}%</StatNumber>
                </Stat>
              </StatGroup>
              <Text color="gray.500" textAlign="center">
                Score = WPM × Accuracy Multiplier<br/>
                Higher accuracy gives a better multiplier (0.5x to 1.5x)
              </Text>
              <Button colorScheme="blue" onClick={handleReset}>
                Try Again
              </Button>
            </VStack>
          ) : (
            <>
              <StatGroup w="full">
                <Stat>
                  <StatLabel color="gray.400">WPM</StatLabel>
                  <StatNumber color="white">{wpm}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel color="gray.400">Accuracy</StatLabel>
                  <StatNumber color="white">{accuracy}%</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel color="gray.400">Time</StatLabel>
                  <StatNumber color="white">{timeLeft}s</StatNumber>
                </Stat>
              </StatGroup>

              <HStack spacing={4}>
                {Object.values(TIME_MODES).map((mode) => (
                  <Button
                    key={mode.label}
                    onClick={() => {
                      setTimeMode(mode)
                      initializeTest()
                    }}
                    variant={timeMode === mode ? 'solid' : 'outline'}
                    colorScheme="blue"
                    bg={timeMode === mode ? 'blue.400' : 'gray.700'}
                    _hover={{
                      bg: timeMode === mode ? 'blue.500' : 'gray.600'
                    }}
                    size="lg"
                  >
                    {mode.label}
                  </Button>
                ))}
              </HStack>

              <Box
                w="100%"
                bg={wordBgColor}
                p={6}
                borderRadius="lg"
                boxShadow="lg"
                border="1px"
                borderColor={borderColor}
                onClick={() => inputRef.current?.focus()}
                position="relative"
                minH="150px"
              >
                <VStack spacing={6} align="stretch">
                  {Array.from({ length: VISIBLE_LINES }).map((_, lineIndex) => {
                    const visibleWords = getVisibleWords()
                    const lineWords = visibleWords.slice(
                      lineIndex * WORDS_PER_LINE,
                      (lineIndex + 1) * WORDS_PER_LINE
                    )
                    const currentLine = Math.floor(currentWordIndex / WORDS_PER_LINE)
                    const visibleStartLine = Math.max(0, currentLine - 1)
                    const thisLineNumber = visibleStartLine + lineIndex

                    if (lineWords.length === 0) return null

                    return (
                      <Flex
                        key={thisLineNumber}
                        wrap="wrap"
                        gap={3}
                        fontSize="xl"
                        fontFamily="mono"
                        color="gray.400"
                      >
                        {lineWords.map((word, wordIndex) => {
                          const globalWordIndex = (thisLineNumber * WORDS_PER_LINE) + wordIndex
                          const isCurrent = globalWordIndex === currentWordIndex
                          const state = wordStates[globalWordIndex]

                          return (
                            <Word
                              key={globalWordIndex}
                              word={word}
                              active={isCurrent}
                              typed={isCurrent ? currentInput : ''}
                              state={state}
                            />
                          )
                        })}
                      </Flex>
                    )
                  })}
                </VStack>
                <input
                  ref={inputRef}
                  type="text"
                  value={currentInput}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  style={{
                    position: 'absolute',
                    opacity: 0,
                    height: 0,
                    width: 0,
                  }}
                  autoFocus
                />
              </Box>

              <Button
                colorScheme="blue"
                size="lg"
                onClick={initializeTest}
                bg="blue.400"
                _hover={{ bg: 'blue.500' }}
              >
                Reset Test
              </Button>
            </>
          )}
        </VStack>
      </Container>
    </Box>
  )
}

export default App
