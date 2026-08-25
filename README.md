# Customer Feedback Intelligence Dashboard

A full-stack customer feedback intelligence platform that collects feedback from multiple sources, automatically categorizes feedback using lightweight Natural Language Processing (NLP), and provides an interactive analytics dashboard.

The system is built with **FastAPI + relational database** on the backend and **React + TypeScript** on the frontend.

---

## 🚀 Live Demo

### Frontend

[Customer Feedback Intelligence Dashboard](https://feedback-intelligence-opal.vercel.app)

### Backend API / Swagger

[Backend Swagger Documentation](https://feedback-intelligence-backend.vercel.app/docs)

---

# 📌 Project Overview

Companies receive customer feedback from many different sources such as:

* Email
* Website
* Mobile applications
* Social media
* Customer support
* Surveys

Manually analyzing this feedback can be time-consuming.

This project provides a centralized system where customer feedback can be submitted, stored, automatically categorized, searched, filtered, and analyzed through an analytics dashboard.

Each feedback record belongs to one of four categories:

| Category           | Description                                                             |
| ------------------ | ----------------------------------------------------------------------- |
| 🐛 Bug             | Reports of errors, crashes, broken functionality, or technical problems |
| 🚀 Feature Request | Requests for new functionality or improvements                          |
| 😡 Complaint       | Negative feedback about an existing product/service experience          |
| ❤️ Praise          | Positive feedback, appreciation, or compliments                         |

When a user submits feedback **without specifying a category**, the backend uses an NLP-based categorization layer to analyze the message and suggest the most appropriate category.

---

# 🏗️ Architecture

The application follows a separated frontend/backend architecture.


# 🛠️ Technology Stack

## Backend
* Python
* FastAPI
* Pydantic
* SQLAlchemy
* PostgreSQL
* NLP library
* UUID
* REST API
* API rate limiting
* Audit logging
* Swagger / OpenAPI

## Frontend

* React
* TypeScript
* Vite
* REST API
* Charting library
* CSS

## Deployment

* Frontend: Vercel
* Backend: Vercel
* Database: Relational database

---

# ✨ Main Features

## 1. Feedback Submission

The API accepts new feedback containing information such as:

```json
{
  "customer_name": "John Doe",
  "source": "email",
  "message": "The app keeps crashing on startup after the latest update.",
  "category": "Bug"
}
```

The backend validates the request before storing it.

---

# 2. Automatic NLP Categorization

The category is optional when submitting feedback.

For example:

```json
{
  "customer_name": "John Doe",
  "source": "email",
  "message": "The app keeps crashing every time I open it."
}
```

Since no category is supplied, the backend analyzes the message.

The NLP categorization layer determines the most appropriate category:

```text
Input
  |
  v
Customer feedback text
  |
  v
NLP preprocessing
  |
  v
Category analysis
  |
  +----> Bug
  |
  +----> Feature Request
  |
  +----> Complaint
  |
  +----> Praise
  |
  v
Save categorized feedback
```

The four supported categories are:

```text
Bug
Feature Request
Complaint
Praise
```

The NLP component is intentionally lightweight so that the application can run without requiring a large machine-learning infrastructure.

---

# 3. Feedback List

The dashboard provides a feedback list/table containing information such as:

* Customer name
* Source
* Message
* Category
* Created date

Example:

| Customer | Source  | Message                   | Category        | Date       |
| -------- | ------- | ------------------------- | --------------- | ---------- |
| John Doe | Email   | App keeps crashing        | Bug             | 2026-06-19 |
| Sarah    | Website | Please add dark mode      | Feature Request | 2026-06-19 |
| Michael  | Mobile  | Support response was slow | Complaint       | 2026-06-19 |
| Hana     | Email   | Excellent application     | Praise          | 2026-06-19 |

---

# 4. Filtering

Feedback can be filtered by:

### Category

```text
All
Bug
Feature Request
Complaint
Praise
```

### Source

Examples:

```text
Email
Website
Mobile
Social Media
Support
```

### Search

Users can search feedback using message/customer text.

Example:

```text
Search: crash
```

The dashboard will return relevant feedback records.

---

# 5. Analytics Dashboard

The dashboard provides aggregated feedback statistics.

Example:

```text
Total Feedback       250

Bug                   65
Feature Requests      80
Complaints            70
Praise                35
```

The statistics can be represented using charts such as:

* Pie chart
* Bar chart
* Category summary cards

Example:

```mermaid
pie title Customer Feedback Distribution
    "Bug" : 65
    "Feature Request" : 80
    "Complaint" : 70
    "Praise" : 35
```

---

# 🔐 Security and Reliability

Several backend protections were implemented.

## API Rate Limiting

API rate limiting is implemented to prevent excessive requests and reduce abuse.

Conceptually:

```text
Client
   |
   | HTTP Request
   v
Rate Limiter
   |
   +---- Request allowed ----> API
   |
   +---- Limit exceeded ----> 429 Too Many Requests
```

This protects public API endpoints from excessive traffic and accidental request flooding.

---

# 📝 Audit Logging

The backend also maintains audit logs for important API activities.

An audit event can contain information such as:

```text
Action
Timestamp
Endpoint
Request information
User/client information
Result
```

Example:

```json
{
  "action": "CREATE_FEEDBACK",
  "endpoint": "/feedback",
  "timestamp": "2026-06-19T10:00:00Z",
  "status": "SUCCESS"
}
```

Audit logging provides better:

* Traceability
* Debugging
* Security monitoring
* Accountability
* Operational visibility

---

# 📡 API

The backend exposes a REST API through FastAPI.

Interactive API documentation is available here:

[Open Swagger API Documentation](https://feedback-intelligence-backend.vercel.app/docs?utm_source=chatgpt.com)

---

## Create Feedback

```http
POST /feedback
```

Example request:

```json
{
  "customer_name": "John Doe",
  "source": "email",
  "message": "The application crashes when I try to login."
}
```

If the category is omitted, the NLP categorization service automatically determines the category.

Example response:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "customer_name": "John Doe",
  "source": "email",
  "message": "The application crashes when I try to login.",
  "category": "Bug",
  "created_at": "2026-06-19T10:00:00Z"
}
```

---

# Get Feedback

```http
GET /feedback
```

Returns feedback records.

Example:

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "customer_name": "John Doe",
    "source": "email",
    "message": "The application crashes when I try to login.",
    "category": "Bug",
    "created_at": "2026-06-19T10:00:00Z"
  }
]
```

---

# Filter Feedback

Example:

```http
GET /feedback?category=Bug
```

Filter by source:

```http
GET /feedback?source=email
```

Search:

```http
GET /feedback?search=crash
```

Filters can also be combined depending on the supported API parameters.

---

# Feedback Statistics

```http
GET /feedback/stats
```

Returns aggregated category statistics.

Example:

```json
{
  "total": 250,
  "Bug": 65,
  "Feature Request": 80,
  "Complaint": 70,
  "Praise": 35
}
```

These statistics are consumed by the frontend dashboard to generate charts and summary cards.

---

# 📦 Example Data Model

```json
{
  "id": "uuid-v4-string",
  "customer_name": "John Doe",
  "source": "email",
  "message": "The app keeps crashing on startup after the latest update.",
  "created_at": "2026-06-19T10:00:00Z",
  "category": "Bug"
}
```

### Fields

| Field           | Type        | Description                |
| --------------- | ----------- | -------------------------- |
| `id`            | UUID        | Unique feedback identifier |
| `customer_name` | String      | Customer name              |
| `source`        | String      | Feedback source            |
| `message`       | String      | Customer feedback          |
| `created_at`    | DateTime    | Submission timestamp       |
| `category`      | Enum/String | Feedback classification    |

---

# 📁 Suggested Backend Structure

```text
backend/
│
├── app/
│   ├── main.py
│   │
│   ├── models/
│   │   └── feedback.py
│   │
│   ├── schemas/
│   │   └── feedback.py
│   │
│   ├── routes/
│   │   └── feedback.py
│   │
│   ├── services/
│   │   └── nlp_classifier.py
│   │
│   ├── database/
│   │   └── database.py
│   │
│   ├── middleware/
│   │   ├── rate_limit.py
│   │   └── audit_log.py
│   │
│   └── utils/
│
├── requirements.txt
├── .env
└── README.md
```



---

# ⚙️ Local Backend Setup

## 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <PROJECT_DIRECTORY>
```

---

## 2. Create a virtual environment

### Windows

```bash
python -m venv venv
```

Activate it:

```bash
venv\Scripts\activate
```

### Linux/macOS

```bash
python3 -m venv venv
```

```bash
source venv/bin/activate
```

---

## 3. Install dependencies

```bash
pip install -r requirements.txt
```

---

## 4. Configure environment variables

Create:

```text
.env
```

Example:

```env
DATABASE_URL=sqlite:///./feedback.db
```
For PostgreSQL:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/feedback_db


## 5. Run the backend

**Install dep**
```pip install -r requirements.txt```
```bash
uvicorn app.main:app --reload
```

The API will normally be available at:

```text
http://localhost:8000
```
Swagger:

```text
http://localhost:8000/docs
```

---

# ⚙️ Local Frontend Setup
Go to the frontend directory:

```bash
cd frontend
```

**Install dependencies:**
```bash
npm install
```

Create the environment file:

```text
.env
```

Example:

```env
VITE_API_URL=http://localhost:8000
```

Run the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

# 🌐 Production Configuration

The deployed frontend communicates with the deployed FastAPI backend.

```text
React Frontend
     |
     | HTTPS
     v
FastAPI Backend
     |
     v
Relational Database
```

Production frontend:
https://feedback-intelligence-opal.vercel.app
Production API:
https://feedback-intelligence-backend.vercel.app/docs

---

# 🧠 NLP Categorization Design

The NLP functionality is implemented as a separate backend service/module rather than putting classification logic directly inside the API route.

This provides separation of responsibilities:

```text
API Route
   |
   v
Validation
   |
   v
NLP Classification Service
   |
   v
Category
   |
   v
Database
```

This design makes it easier to replace or improve the classifier in the future.

For example, the lightweight NLP implementation can later be replaced with:

```text
Current lightweight NLP
        |
        v
Machine Learning Classifier
        |
        v
Transformer / LLM-based Classifier
```

without significantly changing the API layer.

---

# 🎯 Design Decisions

## FastAPI

FastAPI was selected because it provides:

* High performance
* Automatic OpenAPI documentation
* Request validation through Pydantic
* Easy asynchronous API development
* Clean API structure
* Excellent Python ecosystem support

---

## Relational Database

A relational database was selected because feedback records have a predictable structure.

The database is suitable for:

* Filtering
* Aggregations
* Category statistics
* Searching
* Structured reporting

PostgreSQL is recommended for production environments, while SQLite provides a simple setup for local development.

---

## React + TypeScript

React was selected for the dashboard because it provides a component-based architecture suitable for interactive dashboards.

TypeScript provides:

* Type safety
* Better developer experience
* Safer API integration
* Easier maintenance

---

# 🔒 Security Considerations

The application considers several security and reliability concerns:

### Input Validation

Incoming feedback is validated before processing.

### Rate Limiting

Requests are rate limited to prevent API abuse and excessive traffic.

### Audit Logging

Important API operations are recorded for traceability and monitoring.

### Environment Variables

Sensitive configuration such as database credentials should be stored using environment variables rather than committed to source control.

### CORS

The backend should only allow trusted frontend origins in production.

### UUID IDs

Feedback records use UUID-based identifiers rather than sequential IDs.

---

# 📊 Dashboard Architecture

```text
                    ┌──────────────────────────┐
                    │      React Dashboard     │
                    └────────────┬─────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │       API Service         │
                    │         FastAPI           │
                    └────────────┬─────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
              ▼                  ▼                  ▼
       ┌────────────┐     ┌────────────┐     ┌────────────┐
       │ Validation │     │ NLP Engine │     │Rate Limiter│
       └────────────┘     └────────────┘     └────────────┘
              │                  │
              └─────────┬────────┘
                        ▼
                ┌───────────────┐
                │   Database    │
                └───────────────┘
                        │
                        ▼
                ┌───────────────┐
                │   Audit Log   │
                └───────────────┘
```

---

# 🧪 Example NLP Scenarios

### Bug

Input:

```text
The application crashes whenever I upload a profile picture.
```

Expected:

```text
Bug
```

---

### Feature Request

Input:

```text
It would be great if the application supported dark mode.
```

Expected:

```text
Feature Request
```

---

### Complaint

Input:

```text
I have contacted support three times and nobody has responded.
```

Expected:

```text
Complaint
```

---

### Praise

Input:

```text
The new application is fast and very easy to use. Great work!
```

Expected:

```text
Praise
```

---

# 🔮 Future Improvements

Possible future improvements include:

* User authentication and role-based access control
* Pagination for large feedback datasets
* Advanced full-text search
* Sentiment analysis
* Confidence scores for NLP classifications
* Manual category correction
* NLP model training using historical feedback
* Export feedback to CSV/Excel
* Date-range analytics
* Source-specific analytics
* Real-time dashboard updates
* Email/Slack notifications for critical complaints
* Background processing using Celery/RQ
* PostgreSQL full-text search
* Docker deployment
* Automated CI/CD testing

---

# 📈 Possible Future Analytics

The current architecture can be extended to provide:

```text
Total Feedback
       │
       ├── By Category
       │
       ├── By Source
       │
       ├── By Date
       │
       ├── By Sentiment
       │
       └── By Customer
```

For example:

```text
Feedback Trend

June
 ├── Week 1: 32
 ├── Week 2: 45
 ├── Week 3: 61
 └── Week 4: 72
```

This could help companies identify increases in bugs or complaints over time.

---

# 📋 Requirements Mapping

| Requirement              | Implementation                          |
| ------------------------ | --------------------------------------- |
| Accept feedback          | FastAPI REST endpoint                   |
| Validate feedback        | Pydantic/request validation             |
| Store feedback           | Relational database                     |
| UUID identifier          | UUID                                    |
| Four categories          | Bug, Feature Request, Complaint, Praise |
| Automatic categorization | NLP service                             |
| List feedback            | REST API                                |
| Filter by category       | API filtering                           |
| Filter by source         | API filtering                           |
| Search feedback          | Search/filter API                       |
| Category statistics      | Aggregation endpoint                    |
| Dashboard                | React + TypeScript                      |
| Charts                   | Frontend chart components               |
| Rate limiting            | API rate limiting                       |
| Audit trail              | Audit logging                           |
| API documentation        | FastAPI Swagger/OpenAPI                 |
| Deployment               | Vercel                                  |

---

# 🧩 Trade-offs

### Lightweight NLP vs Large AI Model

A lightweight NLP approach was selected because it is:

* Easier to deploy
* Faster
* Less expensive
* Suitable for a small demonstration/application
* Does not require GPU infrastructure

However, a lightweight classifier may not understand complex language as well as a trained ML/LLM model.

For a production system with a large historical dataset, a supervised classification model could provide better accuracy.

---

### SQLite vs PostgreSQL

SQLite is convenient for local development because it requires almost no infrastructure.

PostgreSQL is more appropriate for production because it provides better:

* Concurrent access
* Scalability
* Indexing capabilities
* Advanced querying
* Production reliability

---

# 📚 API Documentation

The complete interactive API documentation is available through Swagger:

[Swagger / OpenAPI Documentation](https://feedback-intelligence-backend.vercel.app/docs?utm_source=chatgpt.com)

You can use Swagger to:

1. View available endpoints
2. Inspect request schemas
3. Test API endpoints
4. Submit feedback
5. Retrieve feedback
6. Test filtering
7. Retrieve analytics

---

# 🌍 Live Application

The deployed dashboard can be accessed here:

[Customer Feedback Intelligence Dashboard](https://feedback-intelligence-opal.vercel.app/?utm_source=chatgpt.com)

---

# 👨‍💻 Author

Developed as a full-stack customer feedback intelligence solution demonstrating:

* Backend API development
* Database design
* REST API architecture
* NLP integration
* React dashboard development
* TypeScript
* Data visualization
* API security
* Rate limiting
* Audit logging
* Production deployment

---

# 📄 License

This project is intended for educational, demonstration, and technical assessment purposes.
