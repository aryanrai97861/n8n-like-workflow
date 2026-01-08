import google.generativeai as genai
from app.core.config import settings
from typing import Optional

genai.configure(api_key=settings.GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-pro')

async def generate_response(
    prompt: str, 
    context: str = "", 
    api_key: Optional[str] = None,
    use_web_search: bool = False
) -> str:
    """
    Generate response using Google Gemini.
    
    Args:
        prompt: The user's question/prompt
        context: Optional context from knowledge base
        api_key: Optional custom API key
        use_web_search: Whether to include web search (requires SerpAPI)
    
    Returns:
        Generated response text
    """
    try:
        # Configure API key
        if api_key:
            genai.configure(api_key=api_key)
        else:
            genai.configure(api_key=settings.GOOGLE_API_KEY)
        
        # Build the full prompt
        full_prompt = prompt
        
        # Add web search context if requested
        if use_web_search and settings.SERPAPI_API_KEY:
            from app.services.web_search import search_web_async
            web_results = await search_web_async(prompt, num_results=3)
            if web_results and "error" not in web_results.lower():
                context = f"{context}\n\nWeb Search Results:\n{web_results}" if context else f"Web Search Results:\n{web_results}"
        
        # Add knowledge base context if provided
        if context:
            full_prompt = f"Context:\n{context}\n\nQuestion:\n{prompt}"
        
        # Generate response
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(full_prompt)
        
        return response.text
        
    except Exception as e:
        error_msg = f"Error generating response: {str(e)}"
        print(error_msg)
        return error_msg
