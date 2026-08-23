# RightPath — AI RTI Copilot

> **Making public services understandable, actionable, and accessible to everyone.**

RightPath is an AI-powered **RTI assistance and public-service navigation platform** designed to help citizens understand their rights, navigate government procedures, identify relevant schemes, draft documents, and turn complex bureaucratic information into clear, actionable steps.

Built as a full-stack AI application, RightPath combines **Retrieval-Augmented Generation (RAG), multilingual AI, document intelligence, rule-based workflows, and personalized action planning** into a single citizen-facing workspace.

---

## Table of Contents

* [Overview](#overview)
* [The Problem](#the-problem)
* [Our Solution](#our-solution)
* [Key Features](#key-features)
* [The RightPath Copilot](#the-rightpath-copilot)
* [Multilingual Accessibility](#multilingual-accessibility)
* [How It Works](#how-it-works)
* [System Architecture](#system-architecture)
* [Technology Stack](#technology-stack)
* [Project Structure](#project-structure)
* [Backend API](#backend-api)
* [RAG & Knowledge Pipeline](#rag--knowledge-pipeline)
* [Authentication](#authentication)
* [Deployment](#deployment)
* [Local Development](#local-development)
* [Environment Variables](#environment-variables)
* [Testing](#testing)
* [Security Considerations](#security-considerations)
* [Future Roadmap](#future-roadmap)
* [Contributing](#contributing)
* [License](#license)

---

# Overview

Government processes often contain information that is technically public but practically difficult to understand.

Citizens may need to:

* Understand the RTI Act
* Identify the correct authority
* Determine what information can be requested
* Draft an RTI application
* Understand bureaucratic terminology
* Track procedural steps
* Discover potentially relevant government schemes
* Understand eligibility requirements
* Prepare complaints or supporting documents

The information exists, but finding and understanding the **right information at the right time** can be difficult.

**RightPath bridges that gap.**

Instead of forcing citizens to search through large documents, websites, regulations, and government terminology, RightPath provides an AI-assisted workflow that transforms complex information into understandable and actionable guidance.

---

# The Problem

## Information exists. Accessibility does not.

Public-service information is often fragmented across:

* Government documents
* Acts and regulations
* Official portals
* Department websites
* Scheme guidelines
* Procedural documents
* Administrative terminology

This creates several challenges:

### 1. Legal and bureaucratic complexity

Citizens may struggle to understand terminology used in government documents and procedures.

### 2. Information overload

Finding the relevant section of a long legal or procedural document can be difficult.

### 3. Lack of procedural clarity

Even after finding the correct information, citizens may not know:

> "What should I do next?"

### 4. Language barriers

Important information may not be equally accessible to citizens who are more comfortable using regional languages.

### 5. Fragmented workflows

Citizens often need multiple tools for:

* Understanding rights
* Finding information
* Drafting applications
* Checking schemes
* Planning next steps

RightPath brings these capabilities together.

---

# Our Solution

RightPath acts as an **AI-powered citizen assistance layer** over trusted RTI and public-service knowledge.

The platform combines:

```text
Citizen Question
       │
       ▼
   AI Copilot
       │
       ▼
Knowledge Retrieval
       │
       ▼
Relevant Government / RTI Information
       │
       ▼
AI Reasoning + Structured Services
       │
       ▼
Clear Explanation
       │
       ▼
Actionable Next Steps
```

Rather than simply generating an answer, RightPath focuses on helping users understand:

**What is happening → Why it matters → What they can do next.**

---

# Key Features

## AI RTI Copilot

An AI-powered conversational interface for asking questions related to RTI and public-service procedures.

Users can interact naturally instead of searching through complex documents manually.

---

## Rights Navigator

Helps users understand their rights and navigate relevant RTI provisions and procedural information.

The system retrieves relevant knowledge from the project's curated RTI knowledge base before generating responses.

---

## Bureaucracy Translator

Converts complicated bureaucratic or administrative language into simpler explanations.

### Example

```text
Complex administrative terminology
                ↓
        AI Interpretation
                ↓
Simple citizen-friendly explanation
```

This is particularly useful when users encounter unfamiliar terminology in official documents.

---

## Scheme Eligibility

Helps users evaluate whether a government scheme may be relevant based on the information they provide.

The service is designed to transform complex eligibility conditions into a more understandable decision-oriented interaction.

---

## Action Roadmap

Instead of stopping at an explanation, RightPath helps organize the next steps a citizen may need to consider.

Example workflow:

```text
Understand the issue
        ↓
Identify relevant authority
        ↓
Understand required information
        ↓
Prepare the necessary document
        ↓
Submit / proceed with the appropriate process
        ↓
Track the next stage
```

---

## Pitch Generator

Generates structured descriptions or pitches based on a user's situation.

This can help convert a complex citizen issue into a concise and understandable explanation for communicating the problem.

---

# The RightPath Copilot

The main Copilot workspace contains six major capabilities:

| Module                     | Purpose                                       |
| -------------------------- | --------------------------------------------- |
| **Chatbot**                | Ask questions and receive AI-assisted answers |
| **Rights Navigator**       | Explore rights and relevant RTI information   |
| **Bureaucracy Translator** | Simplify administrative terminology           |
| **Scheme Eligibility**     | Evaluate potential scheme relevance           |
| **Action Roadmap**         | Turn information into actionable steps        |
| **Pitch Generator**        | Generate structured issue descriptions        |

These modules work together to create a unified citizen-assistance workflow.

---

# Multilingual Accessibility

RightPath supports multiple languages to make public-service information more accessible.

### Supported languages

* English
* Hindi
* Tamil
* Telugu
* Malayalam

The multilingual layer is designed to reduce language barriers when interacting with the platform.

```text
User Input
    │
    ▼
Language Identification / Selection
    │
    ▼
AI Processing
    │
    ▼
Knowledge Retrieval
    │
    ▼
Response Generation
    │
    ▼
Localized User Experience
```

---

# How It Works

RightPath uses a combination of **retrieval, AI reasoning, and deterministic services**.

## High-Level Flow

```text
                    ┌─────────────────────┐
                    │       Citizen       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Next.js Frontend   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    FastAPI Backend   │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
        ┌──────────┐    ┌────────────┐   ┌──────────────┐
        │   RAG    │    │ AI Services│   │ Rule-Based   │
        │  Engine  │    │            │   │  Services    │
        └────┬─────┘    └─────┬──────┘   └──────┬───────┘
             │                │                 │
             ▼                ▼                 ▼
        ┌────────────────────────────────────────────┐
        │          Response / Action Layer           │
        └──────────────────────┬─────────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Citizen-Friendly UI │
                    └─────────────────────┘
```

---

# System Architecture

## Frontend

The frontend is built with **Next.js 14** and provides the main user-facing experience.

Responsibilities include:

* Authentication
* Copilot workspace
* Multilingual interface
* Chat interactions
* Navigation
* Theme management
* Citizen-facing workflows

---

## Backend

The backend is built with **FastAPI**.

It provides:

* AI services
* RAG-powered question answering
* Translation
* Scheme evaluation
* Document generation
* Complaint classification
* Jurisdiction resolution
* SLA state management
* Authentication-related APIs

---

## Knowledge Layer

The knowledge layer uses **ChromaDB** as the vector database.

Relevant RTI knowledge is:

```text
Source Documents
      ↓
Data Processing
      ↓
Chunking / Preparation
      ↓
Vector Representation
      ↓
ChromaDB
      ↓
Semantic Retrieval
      ↓
Relevant Context
      ↓
LLM
      ↓
Grounded Response
```

---

# RAG & Knowledge Pipeline

RightPath uses **Retrieval-Augmented Generation (RAG)** to ground AI responses in the project's knowledge base.

## Why RAG?

A general-purpose language model may know about RTI concepts but can:

* Miss specific provisions
* Produce incomplete answers
* Confuse procedural details
* Generate unsupported information

RAG addresses this by retrieving relevant knowledge before response generation.

---

## Pipeline

```text
RTI / Government Knowledge
          │
          ▼
    Data Ingestion
          │
          ▼
    Data Processing
          │
          ▼
   Knowledge Chunks
          │
          ▼
    Vector Storage
          │
          ▼
       ChromaDB
          │
          │
User Query ──────────────┐
                         ▼
                 Semantic Retrieval
                         │
                         ▼
                  Relevant Context
                         │
                         ▼
                    Groq LLM
                         │
                         ▼
              Grounded AI Response
```

---

## Knowledge Sources

The data pipeline includes RTI-related knowledge and an expanded corpus built from multiple knowledge sources.

The repository includes tooling for expanding and preparing the RTI corpus, including:

```text
expand_rti_corpus.py
```

The resulting knowledge is used by the backend's RAG layer.

---

# Intelligent Backend Services

RightPath is not dependent solely on an LLM.

The backend contains specialized services including:

### ComplaintClassifier

Classifies citizen complaints or issues into meaningful categories.

### DocumentDrafter

Assists in preparing structured documents based on the user's situation.

### JurisdictionResolver

Helps determine the relevant administrative jurisdiction or authority.

### SLAStateMachine

Represents procedural/service-level states and transitions.

This combination allows the system to combine:

```text
LLM Intelligence
        +
Knowledge Retrieval
        +
Deterministic Logic
        =
More Structured Citizen Assistance
```

---

# Technology Stack

## Frontend

| Technology           | Purpose                        |
| -------------------- | ------------------------------ |
| Next.js 14           | Web application framework      |
| React                | UI development                 |
| TypeScript           | Type-safe frontend development |
| CSS / Custom styling | UI and theme system            |
| JWT Session Cookie   | Authentication                 |
| i18n                 | Multilingual experience        |

---

## Backend

| Technology | Purpose                           |
| ---------- | --------------------------------- |
| Python     | Backend development               |
| FastAPI    | REST API framework                |
| ChromaDB   | Vector database                   |
| Groq       | LLM inference                     |
| RAG        | Knowledge-grounded generation     |
| JWT        | Authentication/session management |

---

## Infrastructure

| Platform | Role                                 |
| -------- | ------------------------------------ |
| Vercel   | Frontend deployment                  |
| Railway  | Backend deployment                   |
| Render   | Data / supporting service deployment |
| GitHub   | Source control                       |

---

# Project Structure

```text
RTI-hack/
│
├── backend/
│   ├── app/
│   ├── services/
│   ├── routes/
│   ├── models/
│   ├── utils/
│   └── ...
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── public/
│   ├── styles/
│   └── ...
│
├── data_pipeline/
│   ├── RTI data
│   ├── corpus processing
│   ├── ChromaDB data
│   └── ingestion scripts
│
├── DESIGN_BRIEF.md
├── render.yaml
├── .gitignore
└── README.md
```

> The exact internal structure may evolve as the project continues to develop.

---

# Backend API

The current backend exposes dedicated APIs for the major Copilot capabilities.

## Chatbot

```http
POST /api/chatbot/query
```

Used for AI-powered citizen questions and RAG-based responses.

---

## Translator

```http
POST /api/translator/translate
```

Used to simplify or translate bureaucratic language.

---

## Scheme Evaluation

```http
POST /api/schemes/evaluate
```

Used to evaluate potential scheme eligibility/relevance based on submitted information.

---

## Pitch Generation

```http
POST /api/pitch/generate
```

Used to generate structured issue/pitch content.

---

# Authentication

RightPath includes authentication using:

```text
Signup
  ↓
Login
  ↓
JWT Session Cookie
  ↓
Authenticated Application
  ↓
Logout
```

The authentication layer allows the platform to distinguish authenticated sessions from unauthenticated access.

---

# UI & Experience

RightPath uses a citizen-oriented interface designed around clarity rather than exposing the underlying technical complexity.

## Design Principles

### 1. Clarity over complexity

Government procedures can already be complicated.

The interface should not add another layer of complexity.

### 2. Action-oriented information

Responses should help users understand what they can consider doing next.

### 3. Accessible language

Information should be understandable without requiring advanced legal or bureaucratic knowledge.

### 4. Multilingual accessibility

Users should be able to interact with the platform in supported regional languages.

### 5. Focused workflows

The six Copilot modules separate different citizen needs into understandable workflows.

---

# Theme

RightPath supports:

* Light mode
* Dark mode

The UI uses a parchment-inspired visual system to reinforce the document/government-information context while maintaining a modern application experience.

---

# Local Development

## Prerequisites

Make sure the following are installed:

* Node.js 18+
* Python 3.10+
* Git
* npm
* A Groq API key

---

## Clone the Repository

```bash
git clone https://github.com/gunavathibaskaran170/RTI-hack.git

cd RTI-hack
```

---

# Backend Setup

Navigate to the backend:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

### macOS / Linux

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure the required environment variables.

Start the FastAPI server:

```bash
uvicorn main:app --reload
```

The backend should then be available through the configured local API port.

---

# Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create your local environment file:

```bash
.env.local
```

Add the required frontend configuration.

Start the development server:

```bash
npm run dev
```

Open the local Next.js application in your browser.

---

# Environment Variables

Create the appropriate environment files for the frontend and backend.

Example backend configuration:

```env
GROQ_API_KEY=your_groq_api_key
JWT_SECRET=your_secure_secret
```

Example frontend configuration:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

> Environment variable names should match the names expected by the current implementation. Never commit API keys, secrets, or production credentials to Git.

---

# Running the Full Application

For local development, run the services independently.

### Terminal 1 — Backend

```bash
cd backend
uvicorn main:app --reload
```

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

The frontend communicates with the FastAPI backend through the configured API URL.

---

# Deployment

RightPath is structured for a separated frontend/backend deployment architecture.

```text
                    GitHub
                       │
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
      Vercel                    Railway
     Frontend                   Backend
          │                         │
          └────────────┬────────────┘
                       │
                       ▼
                 RightPath
```

---

## Frontend — Vercel

The Next.js frontend can be deployed using Vercel.

The repository includes deployment configuration intended to support the frontend deployment workflow.

---

## Backend — Railway

The FastAPI backend includes deployment configuration for Railway.

Railway can host the backend API separately from the frontend.

---

## Data / Supporting Services — Render

The repository also contains:

```text
render.yaml
```

and deployment-related configuration for the data pipeline and ChromaDB environment.

---

# Deployment Architecture

```text
                         INTERNET
                             │
                             ▼
                    ┌─────────────────┐
                    │     Vercel      │
                    │ Next.js Frontend│
                    └────────┬────────┘
                             │
                             │ API Requests
                             ▼
                    ┌─────────────────┐
                    │    Railway      │
                    │ FastAPI Backend │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
         ┌─────────┐    ┌──────────┐   ┌────────────┐
         │ChromaDB │    │ Groq LLM │   │ AI Services│
         └─────────┘    └──────────┘   └────────────┘
```

---

# Testing

The project includes backend unit tests covering core functionality.

The current implementation includes **7 unit tests**, with the latest reported test state being:

```text
6/7 tests passing
1 test affected by Groq rate limiting / external inference availability
```

The rate-limit-related test should be treated separately from deterministic application logic because external model availability can affect inference-dependent tests.

Run the project's test suite using the test command/configuration provided in the backend.

---

# Engineering Approach

RightPath intentionally combines different types of intelligence instead of treating every problem as an LLM problem.

## Generative AI

Used for:

* Natural-language interaction
* Explanation
* Translation
* Content generation
* Conversational assistance

## Retrieval

Used for:

* Finding relevant RTI knowledge
* Providing contextual information to the LLM
* Reducing unsupported responses

## Deterministic Services

Used for:

* Classification
* Jurisdiction logic
* State transitions
* Structured workflows

This architecture provides a stronger foundation than a simple:

```text
User → LLM → Answer
```

Instead:

```text
User
 ↓
Intent / Service
 ↓
Knowledge Retrieval
 ↓
Relevant Context
 ↓
AI + Deterministic Logic
 ↓
Structured Response
 ↓
Action
```

---

# Responsible AI Considerations

RightPath operates in a domain involving government procedures and citizen rights.

Therefore, the platform should be treated as an **assistance and information-navigation system**, not a replacement for official government authorities or qualified legal professionals.

Important principles include:

* Prefer authoritative knowledge sources
* Ground AI responses using retrieved information
* Avoid presenting generated information as guaranteed legal advice
* Clearly communicate uncertainty where appropriate
* Protect user-provided information
* Never expose API keys or authentication secrets
* Continuously validate knowledge sources
* Keep procedural information up to date

---

# Security Considerations

Production deployments should consider:

* Secure JWT secrets
* HTTPS
* Secure cookies
* CORS configuration
* API rate limiting
* Input validation
* Authentication protection
* Environment secret management
* Dependency security
* Logging without exposing sensitive user data

Never commit:

```text
.env
.env.local
API keys
JWT secrets
private credentials
production tokens
```

to the repository.

---

# Future Roadmap

RightPath can evolve beyond an RTI assistant into a broader **AI-powered citizen-service navigation platform**.

Potential future directions include:

## 1. Official Portal Integration

Connect directly with verified government portals and APIs where available.

---

## 2. Application Tracking

Allow users to track submitted applications and procedural states.

---

## 3. Document Intelligence

Enable users to upload government documents and receive:

* Summaries
* Key dates
* Required actions
* Important clauses
* Missing-information detection

---

## 4. Voice-Based Citizen Assistant

Allow users to interact with RightPath using speech, particularly benefiting users with limited literacy or accessibility needs.

---

## 5. More Indian Languages

Expand beyond the current supported languages to increase accessibility across India.

---

## 6. Personalized Citizen Workspace

Maintain a secure history of:

* Applications
* Questions
* Documents
* Action plans
* Relevant schemes

---

## 7. Verified Knowledge Updates

Introduce automated or semi-automated pipelines for monitoring changes in official regulations, government schemes, and procedural information.

---

## 8. Explainable AI

Provide users with transparent references showing where important information came from.

---

# Vision

RightPath is built around a simple idea:

> **Public information should not only be available. It should be understandable and actionable.**

The long-term vision is to create an intelligent civic-access layer that helps citizens move from:

```text
"I don't understand this."
```

to:

```text
"Now I understand my rights."
```

and ultimately:

```text
"I know what I can do next."
```

---

# Contributing

Contributions are welcome.

To contribute:

```bash
# Fork the repository

# Clone your fork
git clone https://github.com/<your-username>/RTI-hack.git

# Create a feature branch
git checkout -b feature/your-feature

# Make your changes

# Commit
git commit -m "feat: add your feature"

# Push
git push origin feature/your-feature
```

Then open a Pull Request.

---

# Development Guidelines

When contributing:

* Keep frontend and backend responsibilities separated
* Follow existing project conventions
* Avoid hardcoding credentials
* Add tests for important backend functionality
* Keep API contracts consistent
* Document significant architectural changes
* Prefer explainable and deterministic logic where appropriate
* Validate AI-generated functionality against reliable sources

---

# Project Status

**Status:** Active Development

RightPath currently includes:

* AI RTI Copilot
* RAG-based backend
* ChromaDB knowledge store
* Groq-powered LLM integration
* Six Copilot modules
* Multilingual interface
* Authentication
* Specialized backend services
* Next.js frontend
* FastAPI backend
* Data ingestion pipeline
* Deployment configurations for Vercel, Railway, and Render

---

# Built With

**Next.js · React · TypeScript · FastAPI · Python · ChromaDB · RAG · Groq · JWT · Vercel · Railway · Render**

---

# License

This project is currently intended as a hackathon / development project.

If you plan to release RightPath publicly, add an appropriate open-source license such as MIT, Apache-2.0, or another license suitable for the project's ownership and contribution model.

---

# Acknowledgements

Built with a focus on using **Artificial Intelligence for civic accessibility, public-service navigation, and citizen empowerment**.

---

## RightPath

### Understand your rights. Navigate complexity. Find your next step.

**RightPath — AI RTI Copilot**
