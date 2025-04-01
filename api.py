from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from newspaper import Article, Config
from transformers import pipeline
import nltk
from datetime import datetime
from duckduckgo_search import DDGS
from deep_translator import GoogleTranslator
import json

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the transformer pipeline
transformer_summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

# Download required NLTK data
nltk.download(['punkt', 'stopwords'], quiet=True)

class SearchRequest(BaseModel):
    topic: str
    location: Optional[str] = None
    language: str = "en"

class Article(BaseModel):
    title: str
    text: str
    url: str
    source: str
    publish_date: Optional[str]
    image_url: Optional[str]

class ArticleList(BaseModel):
    articles: List[Article]

@app.post("/api/search")
async def search_news(request: SearchRequest):
    try:
        with DDGS() as ddgs:
            keywords = f"{request.topic} {request.location} news" if request.location else f"{request.topic} news"
            results = list(ddgs.news(
                keywords=keywords,
                region='in-en',
                safesearch='off',
                timelimit='m',
                max_results=3
            ))
            
            articles = []
            for result in results:
                article = {
                    'url': result['url'],
                    'source': result['source'],
                    'title': result['title'],
                    'text': result['body'],
                    'publish_date': result['date'],
                    'image_url': result.get('image')
                }
                articles.append(article)
                
            return {"articles": articles}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/summarize")
async def summarize_articles(request: ArticleList):
    try:
        summaries = []
        for article in request.articles:
            summary = transformer_summarizer(
                article.text,
                max_length=130,
                min_length=30,
                do_sample=False
            )[0]['summary_text']
            summaries.append(summary)
        return {"summaries": summaries}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class PublishRequest(BaseModel):
    articles: List[Article]
    summaries: List[str]
    topic: str
    location: Optional[str] = None
    language: str = "en"

@app.post("/api/publish")
async def publish_to_hashnode(request: PublishRequest):
    try:
        # Your existing Hashnode publishing logic here
        # This is a placeholder that returns a mock URL
        mock_url = f"https://hashnode.com/@yourusername/news-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        return {"url": mock_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True) 