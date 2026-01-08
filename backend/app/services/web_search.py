from serpapi import GoogleSearch
from app.core.config import settings
from typing import Optional, List, Dict

def search_web(query: str, num_results: int = 3) -> str:
    """
    Search the web using SerpAPI and return formatted results.
    
    Args:
        query: Search query string
        num_results: Number of results to return (default: 3)
    
    Returns:
        Formatted string with search results
    """
    try:
        if not settings.SERPAPI_API_KEY:
            return "Web search unavailable: SERPAPI_API_KEY not configured"
        
        params = {
            "q": query,
            "api_key": settings.SERPAPI_API_KEY,
            "num": num_results,
            "engine": "google"
        }
        
        search = GoogleSearch(params)
        results = search.get_dict()
        
        if "organic_results" not in results:
            return "No search results found"
        
        # Format results
        formatted_results = []
        for idx, result in enumerate(results["organic_results"][:num_results], 1):
            title = result.get("title", "No title")
            snippet = result.get("snippet", "No description")
            link = result.get("link", "")
            
            formatted_results.append(
                f"{idx}. {title}\n"
                f"   {snippet}\n"
                f"   Source: {link}\n"
            )
        
        return "\n".join(formatted_results)
        
    except Exception as e:
        return f"Web search error: {str(e)}"

async def search_web_async(query: str, num_results: int = 3) -> str:
    """Async wrapper for web search"""
    # SerpAPI is synchronous, but we can wrap it for async contexts
    import asyncio
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, search_web, query, num_results)
