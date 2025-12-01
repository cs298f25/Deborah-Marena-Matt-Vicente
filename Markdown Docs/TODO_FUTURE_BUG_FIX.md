# TODO: Future Bug Fix - Students Tab & Quiz Tab State Management Issues

## Overview

This document outlines bugs discovered in the relationship between the Students tab and Quiz tab, specifically around state management, screen switching, and question persistence.

---

## 🐛 Bug #1: Quiz State Persists When Switching to Students Tab

### Problem
When clicking the "Students" button, the quiz state (`questionList`, `questionAnswers`, `currentTopic`, `currentSubtopic`) is **not cleared**. When returning from Students to Quiz, old questions remain visible.

### Location
- **File**: `src/App.tsx`
- **Line**: 393
- **Code**:
  ```typescript
  onClick={() => setCurrentScreen('students')}
  ```

### Current Behavior
- Only changes the screen to `'students'`
- Does NOT clear `questionList` or `questionAnswers`
- Does NOT reset `currentTopic` or `currentSubtopic`
- Quiz state remains in memory

### Impact
- **User Experience**: When returning from Students tab, old quiz questions are still displayed
- **Data Integrity**: Stale question data persists across screen switches
- **Confusion**: Users see questions from previous session instead of fresh start

### Root Cause
The `startTopic()` function (lines 241-247) is the only place that clears quiz state:
```typescript
function startTopic() {
  currentTopic?.start();
  setSharedCode(currentTopic?.sharedCode || null);
  setQuestionList([]);  // Only cleared here
  setQuestionAnswers([]);  // Only cleared here
  addQuestion();
}
```

But `startTopic()` is only called from `selectTopic()`, which is NOT called when switching to Students tab.

---

## 🐛 Bug #2: Early Return Prevents Restarting Same Topic

### Problem
In `selectTopic()` function, there's an early return that prevents restarting if you're already on the same topic and in question mode.

### Location
- **File**: `src/App.tsx`
- **Lines**: 210-213
- **Code**:
  ```typescript
  // If we're already on this topic and in question mode, don't restart
  if (currentTopic?.id === topic.id && currentScreen === 'question') {
    return;
  }
  ```

### Current Behavior
- If you're on Topic A → Switch to Students → Return to Topic A
- The early return prevents `startTopic()` from being called
- Old questions persist because state is never cleared

### Impact
- **User Experience**: Cannot restart a topic by clicking it again
- **State Management**: Quiz state never refreshes for the same topic
- **Workaround Needed**: Users must select a different topic first, then come back

### Root Cause
The check is designed to prevent unnecessary restarts, but it doesn't account for:
- Returning from a different screen (Students, Dashboard)
- User explicitly wanting to restart the same topic
- State cleanup needed after screen switches

---

## 🐛 Bug #3: Question Order Appears the Same (Random Selection)

### Problem
Questions are generated using weighted random selection, which can produce the same order by chance, making it appear like questions aren't randomizing.

### Location
- **File**: `src/topics.ts`
- **Lines**: 118-140
- **Method**: `Topic.getRandomSubtopic()`

### Current Behavior
```typescript
// 'random-beginning' mode uses weighted random
const weights = incompleteSubtopics.map((_, i) => 2 ** (incompleteSubtopics.length - i));
const rand = Math.random() * sum;
// ... weighted selection logic
```

### Impact
- **User Perception**: Questions may appear in the same order multiple times
- **Learning Experience**: Less variety in question presentation
- **Confusion**: Users think the system is broken when it's actually random

### Root Cause
- No seed or state tracking for question order
- Each call to `getRandomSubtopic()` is independent
- Weighted random can produce similar sequences by chance
- No mechanism to ensure different order on restart

---

## 🐛 Bug #4: Mode Toggle Doesn't Clear Quiz State

### Problem
When switching between Learning/Quiz mode, the quiz state is not cleared, especially when switching while on the Students screen.

### Location
- **File**: `src/App.tsx`
- **Lines**: 374-387
- **Code**:
  ```typescript
  onClick={() => {
    setMode('learning');
    if (currentScreen === 'dashboard') setCurrentScreen('welcome');
  }}
  ```

### Current Behavior
- Mode changes from 'learning' to 'quiz' or vice versa
- Only clears screen if currently on 'dashboard'
- Does NOT clear quiz state (`questionList`, `questionAnswers`)
- Does NOT handle case when on 'students' screen

### Impact
- **State Persistence**: Quiz state carries over when switching modes
- **Inconsistent Behavior**: Mode change behaves differently depending on current screen
- **Data Leakage**: Old quiz data persists when it shouldn't

### Root Cause
- Mode toggle only handles dashboard screen
- No cleanup function called when mode changes
- Quiz state is independent of mode state

---

## 🐛 Bug #5: No Cleanup Function for Screen Switching

### Problem
There's a `resetState()` function that clears everything, but it's only used for logout. There's no intermediate cleanup function for screen switches.

### Location
- **File**: `src/App.tsx`
- **Lines**: 171-181
- **Function**: `resetState()`

### Current Behavior
```typescript
const resetState = () => {
  setCurrentScreen('welcome');
  setCurrentTopic(null);
  setCurrentSubtopic(null);
  setSharedCode(null);
  setQuestionList([]);
  setQuestionAnswers([]);
  setCompletedTopics(new Set());  // ⚠️ Clears ALL progress
  setExpandedGroups(new Set());
  setMode('learning');
};
```

### What's Missing
- No function to clear **only** quiz state while preserving:
  - `completedTopics` (user progress)
  - `expandedGroups` (UI state)
  - `currentUser` (authentication)
  - `mode` (learning/quiz preference)

### Impact
- **No Selective Cleanup**: Can't clear quiz state without losing progress
- **State Management**: All-or-nothing approach limits flexibility
- **Code Reusability**: `resetState()` is too aggressive for screen switches

---

## 📊 State Management Flow Issues

### Current State Variables
```typescript
const [questionList, setQuestionList] = useState<(Question | null)[]>([]);
const [questionAnswers, setQuestionAnswers] = useState<(Answer | typeof SKIPPED)[]>([]);
const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
const [currentSubtopic, setCurrentSubtopic] = useState<Subtopic | null>(null);
const [currentScreen, setCurrentScreen] = useState<'welcome' | 'question' | 'locked-topic' | 'students' | 'dashboard'>('welcome');
const [mode, setMode] = useState<'learning' | 'quiz'>('learning');
```

### State Clearing Points
1. ✅ `startTopic()` - Clears `questionList` and `questionAnswers`
2. ✅ `resetState()` - Clears everything (logout only)
3. ❌ **Missing**: Cleanup when switching to Students tab
4. ❌ **Missing**: Cleanup when switching modes
5. ❌ **Missing**: Cleanup when returning to same topic

---

## 🔍 Additional Observations

### Screen Switching Logic
- **Students Button** (line 393): Only sets screen, no cleanup
- **Dashboard Button** (line 404): Only sets screen, no cleanup
- **Mode Toggle** (lines 374-387): Only clears screen if on dashboard
- **Topic Selection** (line 194): Calls `startTopic()` which clears state

### Question Generation
- Questions are generated on-demand via `addQuestion()` (line 249)
- Uses `getRandomSubtopic()` which has weighted random selection
- No persistence of question order
- No tracking of which questions have been shown

### State Dependencies
- `questionList` and `questionAnswers` are tied to `currentTopic`
- When `currentTopic` changes, old questions should be cleared
- But switching screens doesn't change `currentTopic`, so state persists

---

## 💡 Recommended Fixes

### Fix #1: Clear Quiz State When Switching to Students
**Location**: `src/App.tsx` line 393

**Solution**: Add cleanup function call
```typescript
onClick={() => {
  clearQuizState();  // New function to clear only quiz state
  setCurrentScreen('students');
}}
```

### Fix #2: Remove or Modify Early Return in selectTopic
**Location**: `src/App.tsx` lines 210-213

**Solution**: Check if coming from different screen
```typescript
// Only skip restart if already on same topic AND same screen
if (currentTopic?.id === topic.id && currentScreen === 'question') {
  // But allow restart if coming from different screen
  return;
}
```

### Fix #3: Add Question Order Tracking
**Location**: `src/topics.ts` or `src/App.tsx`

**Solution**: Track shown questions or use seeded random
- Option A: Track which subtopics have been shown in current session
- Option B: Use seeded random number generator
- Option C: Shuffle subtopics once at topic start, then iterate

### Fix #4: Clear Quiz State on Mode Toggle
**Location**: `src/App.tsx` lines 374-387

**Solution**: Add cleanup when mode changes
```typescript
onClick={() => {
  clearQuizState();
  setMode('learning');
  if (currentScreen === 'dashboard' || currentScreen === 'students') {
    setCurrentScreen('welcome');
  }
}}
```

### Fix #5: Create Selective Cleanup Function
**Location**: `src/App.tsx` (new function)

**Solution**: Add function that clears only quiz-related state
```typescript
const clearQuizState = () => {
  setQuestionList([]);
  setQuestionAnswers([]);
  setCurrentSubtopic(null);
  // Optionally: setCurrentTopic(null) if you want to clear topic too
  // But preserve: completedTopics, expandedGroups, currentUser, mode
};
```

---

## 🎯 Priority Levels

### High Priority
1. **Bug #1**: Quiz state persists when switching to Students tab
   - **Impact**: High - Directly affects user experience
   - **Frequency**: Every time user switches tabs

2. **Bug #2**: Early return prevents restarting same topic
   - **Impact**: High - Prevents expected behavior
   - **Frequency**: When returning to same topic

### Medium Priority
3. **Bug #4**: Mode toggle doesn't clear quiz state
   - **Impact**: Medium - Affects mode switching experience
   - **Frequency**: When switching between learning/quiz modes

4. **Bug #5**: No cleanup function for screen switching
   - **Impact**: Medium - Code quality and maintainability
   - **Frequency**: Architectural improvement

### Low Priority
5. **Bug #3**: Question order appears the same
   - **Impact**: Low - Perceived issue, not actual bug
   - **Frequency**: Random chance, not consistent

---

## 📝 Testing Checklist

After implementing fixes, test the following scenarios:

- [ ] Switch from Quiz → Students → Quiz (should show fresh questions)
- [ ] Switch from Quiz → Dashboard → Quiz (should show fresh questions)
- [ ] Click same topic twice in a row (should restart questions)
- [ ] Switch Learning ↔ Quiz mode (should clear quiz state)
- [ ] Switch modes while on Students tab (should work correctly)
- [ ] Complete a topic, switch to Students, return (should show completion screen)
- [ ] Start quiz, answer some questions, switch tabs, return (should preserve progress or restart based on design decision)

---

## 🔗 Related Code Locations

- **State Management**: `src/App.tsx` lines 40-68
- **Screen Switching**: `src/App.tsx` lines 393, 404
- **Topic Selection**: `src/App.tsx` lines 194-222
- **Quiz State Clearing**: `src/App.tsx` lines 241-247
- **Question Generation**: `src/App.tsx` lines 249-276
- **Random Selection**: `src/topics.ts` lines 118-140

---

## 📅 Created
December 1, 2024

## 🔄 Last Updated
December 1, 2024

