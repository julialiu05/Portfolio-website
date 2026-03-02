# JuliaLLM

A RAG-powered chatbot that answers questions about Julia Liu using the Claude API.

## Features

- iOS-style chat interface
- RAG (Retrieval Augmented Generation) for context-aware responses
- Conversation history for multi-turn chats
- Pre-built suggestion buttons for common questions
- Mobile-responsive design

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Add your Anthropic API key to `.env`:

```
ANTHROPIC_API_KEY=your_api_key_here
```

### 3. Local Development

```bash
npm run dev
```

## Deploy to Vercel

### Option 1: Vercel CLI

```bash
npm i -g vercel
vercel
```

### Option 2: GitHub Integration

1. Push this folder to a GitHub repository
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add `ANTHROPIC_API_KEY` in Environment Variables
5. Deploy!

## Project Structure

```
julia-llm/
├── api/
│   └── chat.js       # Serverless function for Claude API
├── context.js        # Julia's portfolio data for RAG
├── index.html        # Chat interface
├── package.json      # Dependencies
├── vercel.json       # Vercel configuration
└── README.md
```

## Customization

### Update Julia's Information

Edit `api/chat.js` - the `juliaContext` object contains all of Julia's information that the chatbot uses to answer questions.

### Modify the System Prompt

In `api/chat.js`, you can customize the `system` prompt to change how the AI responds.

## Tech Stack

- **Frontend**: Vanilla HTML/CSS/JS with iOS-style design
- **Backend**: Vercel Serverless Functions
- **AI**: Claude API (claude-sonnet-4-20250514)
- **RAG**: Simple keyword-based context retrieval
