import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Target, BookOpen, TrendingUp, Award, ChevronRight, Check, X, RotateCcw, Play, Pause } from 'lucide-react';

const SecurityPlusApp = () => {
  // Question database organized by Security+ domains
  const questionBank = {
    "General Security Concepts": [
      {
        id: 1,
        question: "Which of the following BEST describes the principle of least privilege?",
        options: [
          "Users should have maximum access to perform their duties efficiently",
          "Users should have only the minimum access necessary to perform their job functions",
          "Users should have access based on their seniority level",
          "Users should have temporary elevated access when needed"
        ],
        correct: 1,
        explanation: "The principle of least privilege ensures users have only the minimum access rights necessary to perform their job functions, reducing security risks.",
        difficulty: "Easy",
        type: "multiple-choice"
      },
      {
        id: 2,
        question: "What is the primary purpose of implementing defense in depth?",
        options: [
          "To reduce costs by using fewer security controls",
          "To create multiple layers of security controls",
          "To simplify security management",
          "To eliminate the need for user training"
        ],
        correct: 1,
        explanation: "Defense in depth involves implementing multiple layers of security controls so that if one layer fails, others are still in place to protect assets.",
        difficulty: "Medium",
        type: "multiple-choice"
      }
    ],
    "Threats, Vulnerabilities and Mitigations": [
      {
        id: 3,
        question: "Which type of attack involves an attacker intercepting and potentially altering communications between two parties?",
        options: [
          "Replay attack",
          "Man-in-the-middle attack", 
          "Buffer overflow",
          "SQL injection"
        ],
        correct: 1,
        explanation: "A man-in-the-middle (MITM) attack occurs when an attacker secretly intercepts and potentially alters communications between two parties.",
        difficulty: "Easy",
        type: "multiple-choice"
      },
      {
        id: 4,
        question: "You discover that an attacker has been exfiltrating data from your network over several months without detection. What type of threat does this BEST represent?",
        options: [
          "Advanced Persistent Threat (APT)",
          "Distributed Denial of Service (DDoS)",
          "Social engineering attack",
          "Ransomware attack"
        ],
        correct: 0,
        explanation: "An Advanced Persistent Threat (APT) is characterized by prolonged, stealthy access to a network, often involving data exfiltration over extended periods.",
        difficulty: "Medium",
        type: "multiple-choice"
      }
    ],
    "Security Architecture": [
      {
        id: 5,
        question: "Which network segmentation approach would BEST protect critical servers from lateral movement attacks?",
        options: [
          "Placing all servers in a single VLAN",
          "Implementing micro-segmentation with zero trust principles",
          "Using only physical network separation",
          "Relying on host-based firewalls alone"
        ],
        correct: 1,
        explanation: "Micro-segmentation with zero trust principles creates granular security zones that limit lateral movement and require verification for each network interaction.",
        difficulty: "Hard",
        type: "multiple-choice"
      }
    ],
    "Security Operations": [
      {
        id: 6,
        question: "During incident response, what should be your FIRST priority when discovering an active breach?",
        options: [
          "Document everything that happened",
          "Contain the threat to prevent further damage",
          "Identify the root cause of the breach", 
          "Restore affected systems to normal operation"
        ],
        correct: 1,
        explanation: "Containment is the first priority to prevent further damage. Documentation, investigation, and recovery come after containment.",
        difficulty: "Medium",
        type: "multiple-choice"
      }
    ],
    "Security Program Management": [
      {
        id: 7,
        question: "Which framework provides a structured approach for managing cybersecurity risk across an organization?",
        options: [
          "ISO 27001",
          "NIST Cybersecurity Framework",
          "COBIT",
          "All of the above"
        ],
        correct: 3,
        explanation: "All listed frameworks provide structured approaches to cybersecurity risk management, each with different focuses and methodologies.",
        difficulty: "Medium",
        type: "multiple-choice"
      }
    ]
  };

  // Flatten questions for easier access
  const allQuestions = Object.values(questionBank).flat();

  // State management
  const [currentMode, setCurrentMode] = useState('dashboard');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [testTimer, setTestTimer] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [testStartTime, setTestStartTime] = useState(null);
  const [practiceMode, setPracticeMode] = useState('study'); // 'study' or 'test'
  const [selectedDomains, setSelectedDomains] = useState(Object.keys(questionBank));
  const [difficulty, setDifficulty] = useState('all');

  // Performance tracking
  const [userStats, setUserStats] = useState(() => {
    const saved = localStorage.getItem('securityPlusStats');
    return saved ? JSON.parse(saved) : {
      totalQuestions: 0,
      correctAnswers: 0,
      domainStats: {},
      weakAreas: [],
      strongAreas: [],
      timeSpent: 0
    };
  });

  // Save stats to localStorage
  useEffect(() => {
    localStorage.setItem('securityPlusStats', JSON.stringify(userStats));
  }, [userStats]);

  // Timer management
  useEffect(() => {
    let interval = null;
    if (practiceMode === 'test' && testTimer > 0 && !isPaused) {
      interval = setInterval(() => {
        setTestTimer(timer => timer - 1);
      }, 1000);
    } else if (testTimer === 0) {
      finishTest();
    }
    return () => clearInterval(interval);
  }, [testTimer, isPaused, practiceMode]);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get filtered questions based on selected domains and difficulty
  const getFilteredQuestions = useCallback(() => {
    let filtered = [];
    selectedDomains.forEach(domain => {
      if (questionBank[domain]) {
        filtered = [...filtered, ...questionBank[domain]];
      }
    });
    
    if (difficulty !== 'all') {
      filtered = filtered.filter(q => q.difficulty.toLowerCase() === difficulty);
    }
    
    return filtered.sort(() => 0.5 - Math.random()); // Shuffle
  }, [selectedDomains, difficulty]);

  // Start practice session
  const startPractice = (mode, timeLimit = null) => {
    const questions = getFilteredQuestions();
    if (questions.length === 0) {
      alert('No questions available for selected criteria');
      return;
    }
    
    setPracticeMode(mode);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setUserAnswers([]);
    setCurrentMode('practice');
    
    if (mode === 'test' && timeLimit) {
      setTestTimer(timeLimit * 60);
      setTestStartTime(Date.now());
      setIsPaused(false);
    }
  };

  // Handle answer selection
  const handleAnswerSelect = (answerIndex) => {
    if (showFeedback) return;
    
    setSelectedAnswer(answerIndex);
    
    if (practiceMode === 'study') {
      setShowFeedback(true);
      recordAnswer(answerIndex);
    }
  };

  // Record answer and update stats
  const recordAnswer = (answerIndex) => {
    const questions = getFilteredQuestions();
    const question = questions[currentQuestion];
    const isCorrect = answerIndex === question.correct;
    
    const answer = {
      questionId: question.id,
      selected: answerIndex,
      correct: question.correct,
      isCorrect,
      domain: Object.keys(questionBank).find(domain => 
        questionBank[domain].some(q => q.id === question.id)
      ),
      timeSpent: practiceMode === 'test' ? 
        Math.floor((Date.now() - testStartTime) / 1000) : 0
    };
    
    setUserAnswers(prev => [...prev, answer]);
    
    // Update user stats
    setUserStats(prev => {
      const newStats = { ...prev };
      newStats.totalQuestions++;
      if (isCorrect) newStats.correctAnswers++;
      
      // Update domain stats
      const domain = answer.domain;
      if (!newStats.domainStats[domain]) {
        newStats.domainStats[domain] = { total: 0, correct: 0 };
      }
      newStats.domainStats[domain].total++;
      if (isCorrect) newStats.domainStats[domain].correct++;
      
      // Update weak/strong areas
      const domainAccuracy = newStats.domainStats[domain].correct / newStats.domainStats[domain].total;
      if (domainAccuracy < 0.7 && !newStats.weakAreas.includes(domain)) {
        newStats.weakAreas.push(domain);
        newStats.strongAreas = newStats.strongAreas.filter(d => d !== domain);
      } else if (domainAccuracy >= 0.8 && !newStats.strongAreas.includes(domain)) {
        newStats.strongAreas.push(domain);
        newStats.weakAreas = newStats.weakAreas.filter(d => d !== domain);
      }
      
      return newStats;
    });
  };

  // Move to next question
  const nextQuestion = () => {
    const questions = getFilteredQuestions();
    
    if (practiceMode === 'test' && selectedAnswer !== null) {
      recordAnswer(selectedAnswer);
    }
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      finishTest();
    }
  };

  // Finish test/practice session
  const finishTest = () => {
    setCurrentMode('results');
  };

  // Calculate accuracy percentage
  const getAccuracy = () => {
    if (userStats.totalQuestions === 0) return 0;
    return Math.round((userStats.correctAnswers / userStats.totalQuestions) * 100);
  };

  // Get adaptive recommendations
  const getRecommendations = () => {
    const recommendations = [];
    
    if (userStats.weakAreas.length > 0) {
      recommendations.push({
        type: 'focus',
        title: 'Focus Areas',
        content: `Concentrate on: ${userStats.weakAreas.join(', ')}`
      });
    }
    
    const accuracy = getAccuracy();
    if (accuracy < 70) {
      recommendations.push({
        type: 'study',
        title: 'Study More',
        content: 'Your overall accuracy is below 70%. Consider reviewing fundamentals.'
      });
    } else if (accuracy > 85) {
      recommendations.push({
        type: 'ready',
        title: 'Exam Ready',
        content: 'Great job! You\'re performing well across domains.'
      });
    }
    
    return recommendations;
  };

  // Dashboard Component
  const Dashboard = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Security+ Study Center</h1>
        <p className="text-gray-600">Master the Security+ V7 certification with adaptive learning</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-blue-600 font-medium">Accuracy</p>
              <p className="text-2xl font-bold text-blue-800">{getAccuracy()}%</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-green-600 font-medium">Questions Answered</p>
              <p className="text-2xl font-bold text-green-800">{userStats.totalQuestions}</p>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm text-orange-600 font-medium">Weak Areas</p>
              <p className="text-2xl font-bold text-orange-800">{userStats.weakAreas.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center">
            <Award className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-purple-600 font-medium">Strong Areas</p>
              <p className="text-2xl font-bold text-purple-800">{userStats.strongAreas.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {getRecommendations().length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-yellow-800 mb-4">Adaptive Recommendations</h3>
          <div className="space-y-3">
            {getRecommendations().map((rec, index) => (
              <div key={index} className="flex items-start">
                <ChevronRight className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">{rec.title}</p>
                  <p className="text-yellow-700">{rec.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Study Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <BookOpen className="h-6 w-6 text-blue-600 mr-3" />
            <h3 className="text-xl font-semibold">Study Mode</h3>
          </div>
          <p className="text-gray-600 mb-4">Practice with immediate feedback and explanations</p>
          <button 
            onClick={() => setCurrentMode('setup')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Studying
          </button>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <Clock className="h-6 w-6 text-red-600 mr-3" />
            <h3 className="text-xl font-semibold">Practice Test</h3>
          </div>
          <p className="text-gray-600 mb-4">Timed practice tests to simulate exam conditions</p>
          <button 
            onClick={() => setCurrentMode('test-setup')}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
          >
            Take Practice Test
          </button>
        </div>
      </div>

      {/* Domain Performance */}
      {Object.keys(userStats.domainStats).length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Domain Performance</h3>
          <div className="space-y-4">
            {Object.entries(userStats.domainStats).map(([domain, stats]) => {
              const accuracy = Math.round((stats.correct / stats.total) * 100);
              return (
                <div key={domain} className="flex items-center justify-between">
                  <span className="font-medium">{domain}</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className={`h-2 rounded-full ${accuracy >= 80 ? 'bg-green-500' : accuracy >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{width: `${accuracy}%`}}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-12">{accuracy}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  // Setup Component
  const Setup = () => (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Study Mode Setup</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Domains to Study
          </label>
          <div className="space-y-2">
            {Object.keys(questionBank).map(domain => (
              <label key={domain} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedDomains.includes(domain)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedDomains(prev => [...prev, domain]);
                    } else {
                      setSelectedDomains(prev => prev.filter(d => d !== domain));
                    }
                  }}
                  className="mr-2"
                />
                <span>{domain}</span>
                <span className="ml-2 text-sm text-gray-500">
                  ({questionBank[domain].length} questions)
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty Level
          </label>
          <select 
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Levels</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => startPractice('study')}
            disabled={selectedDomains.length === 0}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            Start Study Session
          </button>
          <button
            onClick={() => setCurrentMode('dashboard')}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );

  // Test Setup Component
  const TestSetup = () => (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Practice Test Setup</h2>
      
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            Practice tests simulate exam conditions with timed questions and no immediate feedback.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Duration
          </label>
          <select className="w-full p-2 border border-gray-300 rounded-lg">
            <option value="30">30 minutes (Quick Test)</option>
            <option value="60">60 minutes (Half Test)</option>
            <option value="90">90 minutes (Full Test)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Questions
          </label>
          <select className="w-full p-2 border border-gray-300 rounded-lg">
            <option value="10">10 Questions</option>
            <option value="25">25 Questions</option>
            <option value="50">50 Questions</option>
          </select>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => startPractice('test', 30)}
            className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors"
          >
            Start Practice Test
          </button>
          <button
            onClick={() => setCurrentMode('dashboard')}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );

  // Practice Component
  const Practice = () => {
    const questions = getFilteredQuestions();
    const question = questions[currentQuestion];
    
    if (!question) {
      return <div>No questions available</div>;
    }
    
    return (
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">
              Question {currentQuestion + 1} of {questions.length}
            </h2>
            <p className="text-gray-600">Difficulty: {question.difficulty}</p>
          </div>
          
          {practiceMode === 'test' && testTimer && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-red-600 mr-2" />
                <span className="font-mono text-lg">{formatTime(testTimer)}</span>
              </div>
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </button>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{width: `${((currentQuestion + 1) / questions.length) * 100}%`}}
          ></div>
        </div>

        {/* Question */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium mb-6">{question.question}</h3>
          
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showFeedback && practiceMode === 'study'}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedAnswer === index
                    ? showFeedback
                      ? index === question.correct
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                      : 'border-blue-500 bg-blue-50'
                    : showFeedback && index === question.correct
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <span className="w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center text-sm font-medium">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{option}</span>
                  {showFeedback && (
                    <span className="ml-auto">
                      {index === question.correct ? (
                        <Check className="h-5 w-5 text-green-600" />
                      ) : selectedAnswer === index ? (
                        <X className="h-5 w-5 text-red-600" />
                      ) : null}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Feedback */}
        {showFeedback && practiceMode === 'study' && (
          <div className={`p-4 rounded-lg mb-6 ${
            selectedAnswer === question.correct ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center mb-2">
              {selectedAnswer === question.correct ? (
                <Check className="h-5 w-5 text-green-600 mr-2" />
              ) : (
                <X className="h-5 w-5 text-red-600 mr-2" />
              )}
              <span className="font-medium">
                {selectedAnswer === question.correct ? 'Correct!' : 'Incorrect'}
              </span>
            </div>
            <p className="text-gray-700">{question.explanation}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentMode('dashboard')}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Exit
          </button>
          
          <button
            onClick={nextQuestion}
            disabled={practiceMode === 'test' && selectedAnswer === null}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {currentQuestion === questions.length - 1 ? 'Finish' : 'Next Question'}
          </button>
        </div>
      </div>
    );
  };

  // Results Component
  const Results = () => {
    const correctCount = userAnswers.filter(a => a.isCorrect).length;
    const accuracy = Math.round((correctCount / userAnswers.length) * 100);
    
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Test Results</h2>
          <div className="text-6xl font-bold mb-2">
            <span className={accuracy >= 70 ? 'text-green-600' : 'text-red-600'}>
              {accuracy}%
            </span>
          </div>
          <p className="text-gray-600">
            {correctCount} correct out of {userAnswers.length} questions
          </p>
          <p className={`mt-2 font-medium ${accuracy >= 70 ? 'text-green-600' : 'text-red-600'}`}>
            {accuracy >= 70 ? 'PASS - Great job!' : 'FAIL - Keep studying!'}
          </p>
        </div>

        {/* Detailed Results */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Question Review</h3>
          <div className="space-y-4">
            {userAnswers.map((answer, index) => {
              const question = allQuestions.find(q => q.id === answer.questionId);
              return (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    {answer.isCorrect ? (
                      <Check className="h-5 w-5 text-green-600 mr-3" />
                    ) : (
                      <X className="h-5 w-5 text-red-600 mr-3" />
                    )}
                    <span>Question {index + 1}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {question?.difficulty} | {answer.domain}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentMode('dashboard')}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => {
              setUserAnswers([]);
              setCurrentMode('setup');
            }}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="h-4 w-4 mr-2 inline" />
            Try Again
          </button>
        </div>
      </div>
    );
  };

  // Main render
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {currentMode === 'dashboard' && <Dashboard />}
        {currentMode === 'setup' && <Setup />}
        {currentMode === 'test-setup' && <TestSetup />}
        {currentMode === 'practice' && <Practice />}
        {currentMode === 'results' && <Results />}
      </div>
    </div>
  );
};

export default SecurityPlusApp;
