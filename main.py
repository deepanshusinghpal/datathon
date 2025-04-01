from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from duckduckgo_search import DDGS
from transformers import pipeline
from datetime import datetime
import nltk
from deep_translator import GoogleTranslator
from newspaper import Article as NewspaperArticle, Config
import json

# Initialize FastAPI app
app = FastAPI(title="AI News Hub API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the transformer pipeline for summarization
print("Loading AI model...")
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
print("Model loaded successfully!")

# Download required NLTK data
nltk.download('punkt', quiet=True)

# Available languages
LANGUAGES = {
    "en": "English",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "it": "Italian",
    "pt": "Portuguese",
    "hi": "Hindi",
    "zh": "Chinese",
    "ja": "Japanese",
    "ko": "Korean"
}

# Models for request/response
class SearchRequest(BaseModel):
    topic: str
    location: Optional[str] = None
    language: str = "en"

class Article(BaseModel):
    title: str
    text: str
    url: str
    source: str
    publish_date: Optional[str] = None
    image_url: Optional[str] = None
    summary: Optional[str] = None

class ArticleList(BaseModel):
    articles: List[Article]

class PublishRequest(BaseModel):
    title: str
    content: str
    tags: List[str]
    publication_id: Optional[str] = None

@app.get("/api/languages")
async def get_languages():
    return LANGUAGES

def safe_translate(text: str, target_language: str) -> str:
    """Safely translate text with error handling."""
    if target_language == "en":
        return text
    try:
        translator = GoogleTranslator(source='auto', target=target_language)
        return translator.translate(text)
    except Exception as e:
        print(f"Translation error: {e}")
        return text

@app.get("/")
async def root():
    return {"message": "Welcome to AI News Hub API"}

@app.post("/api/search")
async def search_news(request: SearchRequest):
    try:
        with DDGS() as ddgs:
            # Construct search query
            query = f"{request.topic}"
            if request.location:
                query += f" {request.location}"
            query += " news"

            # Search for news articles
            results = list(ddgs.news(
                keywords=query,
                region='wt-wt',
                safesearch='off',
                timelimit='m',
                max_results=5
            ))

            # Process and translate articles if needed
            articles = []
            for result in results:
                # Extract article content
                try:
                    config = Config()
                    config.browser_user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    news_article = NewspaperArticle(result['url'], config=config)
                    news_article.download()
                    news_article.parse()
                    
                    # Create Article object using pydantic model
                    article = Article(
                        title=safe_translate(result['title'], request.language),
                        text=safe_translate(news_article.text[:1000], request.language),
                        url=result['url'],
                        source=result['source'],
                        publish_date=result.get('date'),
                        image_url=news_article.top_image if hasattr(news_article, 'top_image') else None
                    )
                    articles.append(article)
                except Exception as e:
                    print(f"Error processing article: {e}")
                    continue

            return {"articles": articles}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/summarize")
async def summarize_article(article: Article):
    try:
        summary = summarizer(
            article.text[:1024],
            max_length=130,
            min_length=30,
            do_sample=False
        )[0]['summary_text']
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/publish")
async def publish_to_hashnode(request: PublishRequest):
    try:
        # Create a combined article from summaries
        title = f"News Roundup: {request.topic}"
        if request.location:
            title += f" in {request.location}"
        
        # Combine summaries into content
        content = f"# {title}\n\n"
        for i, (article, summary) in enumerate(zip(request.articles, request.summaries), 1):
            content += f"## {article.title}\n\n"
            content += f"{summary}\n\n"
            content += f"[Read full article]({article.url})\n\n"
            if i < len(request.articles):
                content += "---\n\n"

        # In a real application, you would integrate with Hashnode's API here
        # For now, we'll return a mock URL
        mock_url = f"https://hashnode.com/@yourusername/{request.title.lower().replace(' ', '-')}-{datetime.now().strftime('%Y%m%d')}"
        return {"url": mock_url, "status": "success", "message": "Article published successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)