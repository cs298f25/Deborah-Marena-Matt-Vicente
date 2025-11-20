import { useState, useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import './code.css';
import { Topic, TopicGroup, Subtopic, Question, Answer, isAnswerCorrect } from './topics.ts';
import { TOPICS } from './all_topics.ts';
import QuestionScreen from './components/QuestionScreen.tsx';
import TopicCompletionScreen from './components/TopicCompletionScreen.tsx';
import LockedTopicScreen from './components/LockedTopicScreen.tsx';
import { getPythonLoadPromise } from './python.ts';
import StudentsPage from './pages/RosterUpload.tsx';
import './App.css';
import LoginScreen from './components/LoginScreen';
import { authService } from './services/auth';
import type { User } from './services/auth';
import { responsesService } from './services/responses';
import { progressService } from './services/progress';
import InstructorDashboard from './pages/InstructorDashboard';
import StudentDashboard from './pages/StudentDashboard';

export const SKIPPED = Symbol('(skipped)');

const getAllTopics = (): Topic[] => {
  const topics: Topic[] = [];
  const collectTopics = (items: (Topic | TopicGroup)[]) => {
    for (const item of items) {
      if (item instanceof Topic) {
        topics.push(item);
      } else if (item instanceof TopicGroup) {
        collectTopics(item.topics);
      }
    }
  };
  collectTopics(TOPICS);
  return topics;
};


function App() {
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'question' | 'locked-topic' | 'students' | 'dashboard'>('welcome');
  let [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  let [topicToSelectAfterLoading, setTopicToSelectAfterLoading] = useState<Topic | null>(null);
  const [mode, setMode] = useState<'learning' | 'quiz'>(() => {
    const saved = localStorage.getItem('mode');
    return saved ? saved as 'learning' | 'quiz' : 'learning';
  });
  useEffect(() => { localStorage.setItem('mode', mode); }, [mode]);
  let [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [allTopics] = useState<Topic[]>(getAllTopics());
  const [sharedCode, setSharedCode] = useState<string | null>(null);
  const [currentSubtopic, setCurrentSubtopic] = useState<Subtopic | null>(null);
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(() => {
    let saved = localStorage.getItem('completedTopics');
    saved = saved?.replaceAll('_', '-') || null; // convert old format to new format
    return new Set<string>(saved ? JSON.parse(saved) : []);
  });
  const [currentUser, setCurrentUser] = useState<User | null>(() => authService.getCurrentUser());
  useEffect(() => {
    localStorage.setItem('completedTopics', JSON.stringify(Array.from(completedTopics)));
  }, [completedTopics]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set<string>());
  const [questionList, setQuestionList] = useState<(Question | null)[]>([]);
  const [questionAnswers, setQuestionAnswers] = useState<(Answer | typeof SKIPPED)[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const contentAreaRef = useRef<HTMLDivElement>(null);
  const isInstructor = currentUser?.role === 'instructor';

  // Load Python interpreter
  useEffect(() => {
    getPythonLoadPromise()
      .then(() => {
        setIsLoading(false);
        isLoading = false; // since the selectTopic function uses isLoading, we need to update it here
        if (topicToSelectAfterLoading) {
          selectTopic(topicToSelectAfterLoading);
          setTopicToSelectAfterLoading(null);
        }
      })
      .catch((error) => { setLoadingError(error.message); });
  }, []);

  // Handle URL hash and auto-expand logic
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove the #
      if (hash) {
        // Find the topic by ID
        const topic = allTopics.find(t => t.id === hash);
        
        if (topic) {
          // Find which group contains this topic and expand it
          for (const item of TOPICS) {
            if (item instanceof TopicGroup && item.topics.includes(topic)) {
              setExpandedGroups(prev => new Set([...prev, item.id]));
              break;
            }
          }
          
          // Select the topic (will show lock screen if not accessible)
          selectTopic(topic);
        }
      } else if (expandedGroups.size === 0) {
        // Auto-expand first incomplete group on first load if no hash
        for (const item of TOPICS) {
          if (item instanceof TopicGroup) {
            const firstIncomplete = item.getFirstIncompleteTopic(completedTopics);
            if (firstIncomplete) {
              setExpandedGroups(new Set([item.id]));
              break;
            }
          }
        }
      }
    };

    // Handle initial hash
    handleHashChange();
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [completedTopics]);

  // Syntax highlighting for shared code
  useEffect(() => { Prism.highlightAll(); }, [sharedCode]);
  useEffect(()=>{
    // Adjust token types for some keywords
    Prism.hooks.add('after-tokenize', function(env) {
      let sawFor = false;
      for (const token of env.tokens) {
        if (token.type === 'keyword') {
          if (['and', 'or', 'not', 'is', 'in'].includes(token.content)) {
            token.type = 'operator keyword';
          }
          if (token.content === 'print') { token.type = 'builtin'; }
          if (token.content === 'for') { sawFor = true; }
          if (token.content === 'in') {
            if (!sawFor) { token.type = 'operator keyword'; }
            sawFor = false;
          }
        }
      }
    });
    // Add new token types (at the end, but variable is last since it is catch-all)
    Prism.languages.python = Prism.languages.extend('python', {
      'variable': /\b[a-z_]\w*\b/g,
    });
    Prism.languages.python = Prism.languages.insertBefore('python', 'variable', {
      'constant': /\b[A-Z_][A-Z0-9_]*\b/g,
      'builtin': /\b(?:abs|aiter|all|anext|any|ascii|bin|breakpoint|callable|chr|classmethod|compile|delattr|dir|divmod|enumerate|eval|exec|filter|format|getattr|globals|hasattr|hash|help|hex|id|input|int|isinstance|issubclass|iter|len|locals|map|max|min|next|oct|open|ord|pow|print|property|repr|reversed|round|set|setattr|sorted|staticmethod|sum|super|tuple|type|vars|zip|__import__)\b/g,
      'type': /\b(?:int|float|bool|str|list|dict|tuple|set|range|frozenset|bytes|bytearray|memoryview|complex|type)\b/g,
    });
    Prism.languages.python = Prism.languages.insertBefore('python', 'punctuation', {
      'function-call': /\b[a-zA-Z_]\w*(?=\s*\()/g,
    });
  }, []);

  // Instructors land on the dashboard immediately.
  useEffect(() => {
    if (isInstructor) {
      setCurrentScreen('dashboard');
    }
  }, [isInstructor]);

  const resetState = () => {
    setCurrentScreen('welcome');
    setCurrentTopic(null);
    setCurrentSubtopic(null);
    setSharedCode(null);
    setQuestionList([]);
    setQuestionAnswers([]);
    setCompletedTopics(new Set());
    setExpandedGroups(new Set());
    setMode('learning');
  };

  const handleLogout = () => {
    authService.logout();
    localStorage.removeItem('completedTopics');
    resetState();
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <LoginScreen onLogin={(user) => setCurrentUser(user)} />;
  }

  function selectTopic(topic: Topic) {
    if (isLoading) {
      setTopicToSelectAfterLoading(topic);
      topicToSelectAfterLoading = topic; // just in case loading is done this iteration
      return;
    }
    
    // Check if topic is accessible
    if (!topic.isAccessible(completedTopics)) {
      // Show locked topic screen
      setCurrentTopic(topic);
      setCurrentScreen('locked-topic');
      window.location.hash = topic.id;
      return;
    }
    
    // If we're already on this topic and in question mode, don't restart
    if (currentTopic?.id === topic.id && currentScreen === 'question') {
      return;
    }
    
    setCurrentScreen('question');
    setCurrentTopic(topic);
    currentTopic = topic; // setCurrentTopic updates it for the next render, we also need it now though
    startTopic();
    
    // Update URL hash
    window.location.hash = topic.id;
  }

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const handleGroupClick = (group: TopicGroup) => {
    // Always just toggle expansion for groups
    toggleGroup(group.id);
  };

  const startTopic = () => {
    currentTopic?.start();
    setSharedCode(currentTopic?.sharedCode || null);
    setQuestionList([]);
    setQuestionAnswers([]);
    addQuestion();
  };

  const addQuestion = () => {
    if (currentTopic) {
      const subtopic = currentTopic.getRandomSubtopic();
      setCurrentSubtopic(subtopic);
      if (subtopic === null) {
        // Topic is completed, show completion screen (indicated by a null question)
        // Only add completion screen if it doesn't already exist
        setQuestionList(prev => {
          const hasCompletionScreen = prev.some(q => q === null);
          return hasCompletionScreen ? prev : [...prev, null];
        });
      } else {
        // Topic is not completed, add a new question
        const nextQuestion = subtopic.generateQuestion();
        setQuestionList(prev => [...prev, nextQuestion]);
        setQuestionStartTime(Date.now());
      }
      // Scroll to the new question after it's added
      setTimeout(() => {
        if (contentAreaRef.current) {
          contentAreaRef.current.scrollTo({
            top: contentAreaRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  };

  const handleAnswerSelect = async (answer: Answer | undefined, question: Question) => {
    if (answer === undefined && !completedTopics.has(currentTopic?.id || '')) { return; }

    const skipped = answer === undefined;
    const isCorrect = skipped || isAnswerCorrect(answer, question);

    // Update the answer state for this specific question
    setQuestionAnswers(prev => [...prev, skipped ? SKIPPED : answer]);

    if (currentTopic) {
      // Update subtopic progress
      if (currentSubtopic) {
        currentSubtopic.completed = currentSubtopic.incorrectLastTime ? false : isCorrect;
        currentSubtopic.incorrectLastTime = !isCorrect;
      }

      // Check if all subtopics in the topic are completed
      if (isCorrect) {
        const allCompleted = currentTopic.subtopics.every(v => v.completed);
        if (allCompleted) {
          completedTopics.add(currentTopic.id);
          setCompletedTopics(new Set(completedTopics));
        }
      }
    }

    // Add a new question to the list after a short delay
    setTimeout(() => { addQuestion(); }, skipped ? 25 : 500);

    if (currentUser && currentTopic && currentSubtopic) {
      try {
        const responseData = responsesService.formatResponseData(
          currentUser.id,
          currentTopic.id,
          currentSubtopic.constructor.name,
          question,
          answer ?? null,
          isCorrect,
          Math.floor((Date.now() - questionStartTime) / 1000),
        );

        await responsesService.submitResponse(responseData);

        await progressService.updateProgress(currentUser.id, currentTopic.id, {
          subtopics_completed: currentTopic.numCompletedSubtopics,
          total_subtopics: currentTopic.subtopics.length,
        });
      } catch (error) {
        console.error('Failed to sync to backend:', error);
      }
    }
  };

  const handleRestartTopic = () => {
    if (currentTopic) {
      // Reset all subtopics in the current topic
      // But we don't want to remove it from the completed topics set which is overall progress
      currentTopic.reset();
      
      // Start fresh with the topic
      startTopic();
    }
  };

  const getNextTopic = (): Topic | null => {
    const curIdx = allTopics.findIndex(topic => topic.id === currentTopic?.id);
    const beforeCurrent = allTopics.filter((topic, i) => topic.isAccessible(completedTopics) && !completedTopics.has(topic.id) && i < curIdx);
    const afterCurrent = allTopics.filter((topic, i) => topic.isAccessible(completedTopics) && !completedTopics.has(topic.id) && i > curIdx);
    return afterCurrent[0] ?? beforeCurrent[0];
  };

  const handleNextTopic = () => {
    if (currentTopic) {
      const nextTopic = getNextTopic();
      if (nextTopic) {
        selectTopic(nextTopic);
      } else {
        setCurrentScreen('welcome');
        setCurrentTopic(null);
      }
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <table onClick={() => { setCurrentScreen('welcome'); window.location.hash = ''; }} style={{ cursor: 'pointer' }}><tbody>
          <tr>
            <td rowSpan={2}><img src="https://s3.dualstack.us-east-2.amazonaws.com/pythondotorg-assets/media/files/python-logo-only.svg" alt="Python Logo"/></td>
            <td><h1>Bytepath</h1></td>
          </tr>
          <tr><td className="subtitle">Learning with Small Python Snippets</td></tr>
        </tbody></table>
        <div className="header-actions">
          {!isInstructor && (
            <div className="mode-toggle">
              <button 
                className={`toggle-button ${mode === 'learning' ? 'active' : ''}`}
                onClick={() => setMode('learning')}
              >📚 Learning</button>
              <button 
                className={`toggle-button ${mode === 'quiz' ? 'active' : ''}`}
                onClick={() => setMode('quiz')}
              >✏️ Quiz</button>
            </div>
          )}
          <div className="header-buttons">
            {isInstructor && (
              <button
                onClick={() => setCurrentScreen('students')}
                className={`dashboard-button ${currentScreen === 'students' ? 'active' : ''}`}
              >
                Students
              </button>
            )}
            <button
              onClick={() => setCurrentScreen('dashboard')}
              className={`dashboard-button ${currentScreen === 'dashboard' ? 'active' : ''}`}
            >
              Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="logout-button"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="App-main">
        {currentScreen === 'dashboard' ? (
          currentUser.role === 'instructor' ? (
            <InstructorDashboard />
          ) : (
            <StudentDashboard user={currentUser} />
          )
        ) : isLoading ? (
          <div className="loading-screen">
            <div className="loading-content">
              {loadingError ? (
                <div className="loading-error"><p>{loadingError}</p></div>
              ) : (
                <>
                  <div className="loading-spinner"></div>
                  <h2>Loading Python Interpreter...</h2>
                  <p>Please wait while we initialize the Python environment.</p>
                </>
              )}
            </div>
          </div>
        ) : currentScreen === 'students' ? (
          <div className="content-area" ref={contentAreaRef}>
            <StudentsPage />
          </div>
        ) : (
          <>
            <div className="sidebar">
          <div className="sidebar-content">
            {TOPICS.map((item) => {
              if (item instanceof TopicGroup) {
                const isExpanded = expandedGroups.has(item.id);
                const groupStatus = item.isCompleted(completedTopics) ? 'completed' : 
                                    item.hasCompletedTopics(completedTopics) ? 'in-progress' : 'available';
                
                return (
                  <div key={item.id} className="sidebar-group">
                    <div 
                      className={`sidebar-group-header ${groupStatus}`}
                      onClick={() => handleGroupClick(item)}
                    >
                      <div className="sidebar-group-title">
                        <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>▶</span>
                        <span>{item.name}</span>
                      </div>
                      <span className={`group-status-indicator ${groupStatus}`}>
                        {groupStatus === 'completed' ? '✓' : 
                          groupStatus === 'in-progress' ? '→' : '→'}
                      </span>
                    </div>
                    {isExpanded && (
                      <div className="sidebar-group-content">
                        {item.topics.map((subItem) => {
                          if (subItem instanceof Topic) {
                            const subtopics = subItem.subtopics;
                            const completedSubtopics = subtopics.filter(subtopic => subtopic.completed).length;
                            const percentage = Math.round((completedSubtopics / subtopics.length) * 100);
                            
                            const accessible = subItem.isAccessible(completedTopics);
                            const status = completedTopics.has(subItem.id) ? 'completed' : 
                                          completedSubtopics > 0 ? 'in-progress' : 
                                          accessible ? 'available' : 'locked';
                            
                            return (
                              <div 
                                key={subItem.id}
                                className={`sidebar-item ${status} ${currentTopic === subItem ? 'active' : ''}`}
                                onClick={() => selectTopic(subItem)}
                              >
                                <div className="sidebar-item-header">
                                  <span className="sidebar-item-title">{subItem.name}</span>
                                  <span className={`status-indicator ${status}`}>
                                    {status === 'completed' ? '✓' : 
                                      status === 'in-progress' ? '→' : 
                                      status === 'available' ? '→' : '🔒'}
                                  </span>
                                </div>
                                {currentTopic === subItem && (
                                  <div className="sidebar-item-progress">
                                    <div className="progress-bar">
                                      <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          } else {
                            return null;
                          }
                        })}
                      </div>
                    )}
                  </div>
                );
              } else {
                // Handle individual topics (if any exist outside groups)
                const subtopics = item.subtopics;
                const completedSubtopics = subtopics.filter(subtopic => subtopic.completed).length;
                const percentage = Math.round((completedSubtopics / subtopics.length) * 100);
                
                const accessible = item.isAccessible(completedTopics);
                const status = completedTopics.has(item.id) ? 'completed' : 
                              completedSubtopics > 0 ? 'in-progress' : 
                              accessible ? 'available' : 'locked';
                
                return (
                  <div 
                    key={item.id}
                    className={`sidebar-item ${status} ${currentTopic === item ? 'active' : ''}`}
                    onClick={() => selectTopic(item)}
                  >
                    <div className="sidebar-item-header">
                      <span className="sidebar-item-title">{item.name}</span>
                      <span className={`status-indicator ${status}`}>
                        {status === 'completed' ? '✓' : 
                          status === 'in-progress' ? '→' : 
                          status === 'available' ? '→' : '🔒'}
                      </span>
                    </div>
                    {currentTopic === item && (
                      <div className="sidebar-item-progress">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
            })}
          </div>
        </div>

        <div className="content-area" ref={contentAreaRef}>
          {currentScreen === 'welcome' && (
            <div className="welcome-screen">
              <h2>Welcome to Bytepath</h2>
              {
                completedTopics.size === allTopics.length ? (
                  <div>
                    <p>You have completed all topics for now! 🎉</p>
                    <p>You can restart any topic to review.</p>
                    <p>You may also want to try quiz-mode in the top-right corner.</p>
                  </div>
                ) : (
                  <p>Select an available topic from on the side to start.</p>
                )
              }
              <div className="stats-overview">
                <div className="stat-item">
                  <span className="stat-number">{completedTopics.size}</span>
                  <span className="stat-label">Topics Completed</span>
                </div>
              </div>
            </div>
          )}

              {currentScreen === 'locked-topic' && currentTopic && (
                <LockedTopicScreen
                  topic={currentTopic}
                  completedTopics={completedTopics}
                  onTopicSelect={selectTopic}
                />
              )}

              {currentScreen === 'question' && (
                <div className="topic-container">
                  {sharedCode && (
                    <div className="shared-code">
                  <div className="shared-code-header">Code shared by all questions in this topic:</div>
                  <code className="language-python">
                    {sharedCode}
                  </code>
                </div>
              )}
              <div className="questions-container">
                {questionList.map((question, index) => (
                  question === null ? 
                    <TopicCompletionScreen
                        key={index}
                        topic={currentTopic!}
                        onRestartTopic={handleRestartTopic}
                        onNextTopic={handleNextTopic}
                        nextTopic={getNextTopic()}
                      />
                      : 
                    <QuestionScreen
                      key={index}
                      question={question}
                      userAnswer={questionAnswers[index]}
                      onAnswerSelect={handleAnswerSelect}
                      isQuiz={mode === 'quiz' || currentTopic!.forceQuiz || question.forceQuiz}
                      canSkip={completedTopics.has(currentTopic?.id || '')}
                    />
                  )
                )}
              </div>
            </div>
          )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
