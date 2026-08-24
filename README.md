#  AI Technical Interview Platform

An AI-powered technical interview and coding practice platform designed to help users practice coding problems, submit solutions, execute code securely, track their progress, and receive AI-powered assistance for improving their problem-solving skills.

---

##  Features

###  Authentication & User Management

The platform includes a complete authentication and user management system.

Features:

- User Registration
- User Login
- Password Hashing
- JWT Access Tokens
- JWT Refresh Tokens
- Token Refresh
- Protected Routes
- Current User Authentication
- User Management

---

##  Email OTP Verification

User email verification is handled using OTP.

Features:

- Send OTP
- Verify OTP
- Resend OTP
- OTP Expiration Handling
- Invalid OTP Validation
- Email Verification

### Authentication Flow

```text
Register
   ↓
OTP Sent to Email
   ↓
Verify OTP
   ↓
Account Verified
   ↓
Login
   ↓
Access Token + Refresh Token
   ↓
Access Protected APIs
```

---

##  Problem Bank

The platform provides a structured coding problem management system.

Each problem can contain:

- Title
- Unique Slug
- Difficulty
- Topics
- Problem Description
- Constraints
- Input Description
- Output Description
- Hints
- Supported Programming Languages
- Starter Code
- Function Signature
- Test Cases
- Public Test Cases
- Hidden Test Cases
- Expected Output
- Solution Context
- Optimal Approach
- Expected Time Complexity
- Expected Space Complexity

### Supported Languages

Currently supported problem configurations include:

- Python
- C++
- Java

---

##  Code Submission System

Users can submit solutions for coding problems.

The submission system handles:

- Code Submission
- Submission Tracking
- Test Case Execution
- Public Test Cases
- Hidden Test Cases
- Submission Results
- Accepted Solutions
- Wrong Answers
- Runtime Errors
- Time Limit Exceeded
- Execution Time Tracking
- Memory Usage Tracking

Example submission result:

```json
{
  "submission_id": "uuid",
  "user_id": "uuid",
  "problem_id": 1,
  "language": "python",
  "status": "Accepted",
  "test_cases_passed": 5,
  "total_test_cases": 5,
  "execution_time": 0.00068,
  "memory_used": 16.45,
  "error": null
}
```

---

##  Docker-Based Code Execution

User-submitted Python code is executed using Docker-based isolation.

The execution service is integrated directly into the existing FastAPI backend.

The code execution flow is:

```text
User Submission
       ↓
FastAPI Submission Service
       ↓
Execution Service
       ↓
Docker Container
       ↓
Execute Python Code
       ↓
Run Test Cases
       ↓
Collect Results
       ↓
Return Execution Details
```

The execution system handles:

- Isolated Code Execution
- Multiple Test Cases
- Public Test Cases
- Hidden Test Cases
- Runtime Errors
- Time Limit Handling
- Execution Time Measurement
- Memory Usage Measurement
- Structured Execution Results

Example execution result:

```json
{
  "status": "Accepted",
  "test_cases_passed": 5,
  "total_test_cases": 5,
  "execution_time": 0.00068,
  "memory_used": 16.45,
  "results": [
    {
      "test_case_id": "tc_001",
      "passed": true,
      "actual_output": [0, 2],
      "expected_output": [0, 2],
      "visibility": "public"
    }
  ],
  "error": null
}
```

---

##  Problem Progress Tracking

The platform tracks each user's progress for coding problems.

Features:

- Track Attempted Problems
- Track Solved Problems
- Track Number of Attempts
- Track Submission Results
- Track Latest Submission
- Track Problem Status

Problem states include:

```text
Not Started
Attempted
Solved
```

---

##  Dashboard & Statistics

Users can view their overall coding progress and performance.

Implemented statistics include:

- Total Problems Solved
- Total Problems Attempted
- Total Submissions
- Accepted Submissions
- Difficulty-wise Progress
- Easy Problems Solved
- Medium Problems Solved
- Hard Problems Solved
- Recent Submission Information

---

##  AI Code Analysis & Assistance

The platform includes an AI-powered system for analyzing submitted code and helping users improve their solutions.

Supported analysis modes:

```text
Hint
Analysis
Optimization
Explain
```

The AI system can provide:

- Problem-Solving Hints
- Code Analysis
- Code Explanation
- Optimization Suggestions
- Time Complexity Analysis
- Space Complexity Analysis
- Potential Code Improvements

---

#  API Modules

##  Authentication

```text
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
POST   /auth/send-otp
POST   /auth/verify-otp
POST   /auth/resend-otp
GET    /auth/me
```

---

##  Problems

```text
POST   /problems
GET    /problems
GET    /problems/{problem_id}
GET    /problems/slug/{slug}
```

---

##  Submissions

```text
POST   /submissions
GET    /submissions/{submission_id}
GET    /submissions/user/{user_id}
```

---

##  Progress

```text
GET    /progress
GET    /progress/{problem_id}
```

---

##  Dashboard

```text
GET    /dashboard
```

---

##  AI Analysis

```text
POST   /ai/analyze
```

---

#  System Architecture

```text
                         ┌──────────────────┐
                         │     Frontend     │
                         │   User Interface │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │   FastAPI API    │
                         │    Backend       │
                         └────────┬─────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
        ▼                         ▼                         ▼
┌────────────────┐      ┌────────────────┐      ┌────────────────┐
│ Authentication │      │  Problem Bank  │      │   Submission   │
│   + OTP System │      │                │      │     System     │
└────────────────┘      └────────────────┘      └────────┬───────┘
                                                          │
                                                          ▼
                                                 ┌────────────────┐
                                                 │ Execution       │
                                                 │ Service         │
                                                 └────────┬───────┘
                                                          │
                                                          ▼
                                                 ┌────────────────┐
                                                 │ Docker          │
                                                 │ Code Execution  │
                                                 └────────────────┘

        │                         │
        │                         │
        ▼                         ▼

┌────────────────┐      ┌────────────────┐
│    MongoDB     │      │   AI Service   │
│                │      │ Code Analysis  │
└────────────────┘      └────────────────┘
```

---

#  Project Structure

```text
AI-Technical-Interview-Platform
│
├── Fastapi/
│   │
│   ├── app/
│   │   │
│   │   ├── api/
│   │   │
│   │   ├── database/
│   │   │
│   │   ├── dependencies/
│   │   │
│   │   ├── models/
│   │   │
│   │   ├── services/
│   │   │   ├── execution_service.py
│   │   │   └── ...
│   │   │
│   │   ├── utils/
│   │   │
│   │   └── main.py
│   │
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env
│
└── README.md
```

---

#  Tech Stack

| Category | Technology |
|---|---|
| Backend | FastAPI |
| Programming Language | Python |
| Database | MongoDB |
| Authentication | JWT |
| Password Security | Password Hashing |
| Data Validation | Pydantic |
| Email Verification | OTP |
| Code Execution | Docker |
| AI Integration | AI Code Analysis Service |

---

#  Current Project Status

The following modules have been implemented:

- [x] Authentication & User Management
- [x] User Registration
- [x] User Login
- [x] Password Hashing
- [x] JWT Access Tokens
- [x] JWT Refresh Tokens
- [x] Protected Routes
- [x] Current User Authentication
- [x] Send OTP
- [x] Verify OTP
- [x] Resend OTP
- [x] OTP Expiration Handling
- [x] Problem Bank
- [x] Problem Creation
- [x] Problem Listing
- [x] Problem Details
- [x] Difficulty Filtering
- [x] Code Submission System
- [x] Docker-Based Python Code Execution
- [x] Public Test Cases
- [x] Hidden Test Cases
- [x] Runtime Error Handling
- [x] Time Limit Handling
- [x] Execution Time Tracking
- [x] Memory Usage Tracking
- [x] Submission Tracking
- [x] Problem Progress Tracking
- [x] Solved Problem Tracking
- [x] Attempt Tracking
- [x] Dashboard & Statistics
- [x] AI Code Analysis
- [x] AI Hints
- [x] AI Code Explanation
- [x] AI Optimization Suggestions

---

#  Project Workflow

```text
User Registration
       ↓
Email OTP Verification
       ↓
User Login
       ↓
JWT Authentication
       ↓
Browse Coding Problems
       ↓
Write Solution
       ↓
Submit Code
       ↓
Docker-Based Code Execution
       ↓
Test Against Public & Hidden Cases
       ↓
Store Submission Results
       ↓
Update Problem Progress
       ↓
View Dashboard Statistics
       ↓
Request AI Assistance
       ↓
Improve Problem-Solving Skills
```

---

#  Future Improvements

Possible future improvements include:

- Complete Frontend Integration
- Full C++ Code Execution Support
- Full Java Code Execution Support
- Improved Submission History
- Contest System
- Leaderboards
- Interview Simulation Mode
- Company-Specific Problem Collections
- AI-Generated Interview Questions
- AI Mock Interviews
- Code Similarity Detection
- Improved AI Feedback
- Production Deployment
- Scalable Code Execution Infrastructure

---

#  Project Goal

The goal of this project is to build a complete platform that helps users improve their technical interview preparation through structured coding practice, secure code execution, progress tracking, and AI-powered assistance.

```text
Learn
  ↓
Practice
  ↓
Solve Problems
  ↓
Execute Code
  ↓
Track Progress
  ↓
Understand Mistakes
  ↓
Get AI Assistance
  ↓
Improve
```

---

##  Author

**Suriya Senthilkumar**

Built as part of an effort to create an AI-powered platform for technical interview preparation and coding practice.
