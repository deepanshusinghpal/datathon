# AI News Hub

A powerful news aggregation and summarization platform that uses AI to provide personalized news experiences in multiple languages.

## Features

- 🔍 **Smart News Search**: Search for news articles by topic and location
- 🌐 **Multi-language Support**: Access news in 10 different languages including English, Spanish, French, German, Italian, Portuguese, Hindi, Chinese, Japanese, and Korean
- 🤖 **AI-Powered Summaries**: Get concise summaries of news articles using advanced AI models
- 📱 **Modern UI**: Clean and responsive user interface built with React
- 🔄 **Real-time Updates**: Get the latest news from various sources
- 📝 **Content Publishing**: Ability to publish curated news to Hashnode (coming soon)

## Tech Stack

### Backend
- FastAPI (Python web framework)
- DuckDuckGo Search API for news aggregation
- Transformers (Hugging Face) for AI summarization
- Newspaper3k for article extraction
- Deep Translator for multi-language support

### Frontend
- React.js
- Vite
- Modern UI components
- Responsive design

## Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-news-hub.git
cd ai-news-hub
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Install frontend dependencies:
```bash
cd news-hub-frontend
npm install
```

## Running the Application

### Backend
```bash
python main.py
```
The backend API will run on `http://localhost:8001`

### Frontend
```bash
cd news-hub-frontend
npm run dev
```
The frontend will run on `http://localhost:5173`

### Using Batch Files (Windows)
You can also use the provided batch files for easier startup:
- `start-dev.bat`: Starts both backend and frontend
- `start-frontend.bat`: Starts only the frontend
- `run-frontend.bat`: Alternative frontend start script

## API Endpoints

- `GET /api/languages`: Get list of supported languages
- `POST /api/search`: Search for news articles
- `POST /api/summarize`: Generate AI summary of an article
- `POST /api/publish`: Publish curated news to Hashnode (coming soon)

## Screenshots

[Add your screenshots here]

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/)
- [Hugging Face Transformers](https://huggingface.co/)
- [DuckDuckGo](https://duckduckgo.com/)
- [Newspaper3k](https://github.com/codelucas/newspaper)
- [Deep Translator](https://github.com/nidhaloff/deep-translator)
