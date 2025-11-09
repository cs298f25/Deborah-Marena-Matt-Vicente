# BytePath Enhancement Project
## Final Project Overview

---

## Project Goal
Transform BytePath from client-side only → Full-stack application with instructor management & student analytics

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND (Browser)                     │
│  ┌────────────────────────────────────────────────┐    │
│  │   BytePath Interface (HTML/CSS/JavaScript)     │    │
│  │   • Student Question View                       │    │
│  │   • Instructor Dashboard                        │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                          ↕ HTTPS
┌─────────────────────────────────────────────────────────┐
│               BACKEND (Flask Server)                     │
│  ┌──────────────────┐  ┌──────────────────────────┐   │
│  │  Authentication  │  │   RESTful API            │   │
│  │  (Moravian OAuth)│  │   • /questions           │   │
│  │                  │  │   • /student-progress    │   │
│  └──────────────────┘  │   • /reports             │   │
│                        └──────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│                   DATABASE LAYER                         │
│  ┌──────────┐ ┌──────────┐ ┌─────────────────────┐   │
│  │  Users   │ │ Questions│ │ Student Responses   │   │
│  │          │ │          │ │ & Performance Data  │   │
│  └──────────┘ └──────────┘ └─────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## User Roles & Features

### INSTRUCTOR (Dr. Bush)

**Content Management**
```
┌─────────────────────────────────────┐
│  ADD new questions               │
│  EDIT existing questions          │
│  HIDE/SHOW questions visibility  │
└─────────────────────────────────────┘
```

**Reporting & Analytics**
```
┌──────────────────────────────────────────┐
│ Topic Reports                            │
│    → Weekly assignment performance       │
│                                          │
│    Student Reports                       │
│    → Individual performance metrics      │
│    → Performance trends (line graphs)    │
│    → Time per question                   │
│    → Correct/Incorrect/Skipped breakdown │
└──────────────────────────────────────────┘
```

###  STUDENT

```
┌─────────────────────────────────────┐
│ • Answer questions                  │
│ • Track progress automatically      │
│ • Resume from last position         │
└─────────────────────────────────────┘
```

---

##  Data Capture

```
For Each Question Attempt:
  ✓ Student ID
  ✓ Question ID
  ✓ Response given
  ✓ Correct/Incorrect/Skipped
  ✓ Time spent (seconds)
  ✓ Timestamp
```

---

##  Technical Stack

| Component      | Technology           |
|----------------|---------------------|
| Frontend       | HTML/CSS/JavaScript |
| Backend        | Flask               |
| Authentication | Moravian OAuth SDK  |
| Database       | MySQL/Postgre/mongo |
| Hosting        | TBD                 |

---

##  Implementation Roadmap

```
Phase 1: Foundation
├─ Database schema design
├─ OAuth integration
└─ Basic Flask server setup

Phase 2: Instructor Features
├─ Question CRUD API
├─ Admin dashboard UI
└─ Question management interface

Phase 3: Student Tracking
├─ Interaction logging
├─ Progress persistence
└─ Response time tracking

Phase 4: Analytics
├─ Report generation engine
├─ Data visualization
└─ Performance metrics

Phase 5: Integration & Testing
├─ Frontend-backend integration
├─ Testing & debugging
└─ Documentation
```

---

##  Sample Reports

### Topic Performance Report
```
Topic: Loops & Iteration (Week 3)
─────────────────────────────────────
Total Students:     25
Avg Completion:     88%
Avg Time/Question:  45 sec
Most Difficult:     Question #7 (32% correct)
```

### Student Performance Report
```
Student: John Doe
─────────────────────────────────────
Progress: ████████░░ 80%
Questions Answered: 40/50

Performance Trend:
100% ┤                           ╭─
 80% ┤                    ╭──────╯
 60% ┤         ╭──────────╯
 40% ┤   ╭─────╯
 20% ┤───╯
     └──────────────────────────────
    Week1  Week2  Week3  Week4  Week5
```

---
