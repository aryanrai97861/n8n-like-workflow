import google.generativeai as genai
from app.core.config import settings

genai.configure(api_key=settings.GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-pro')

async def generate_response(prompt: str, context: str = "", api_key: str = None) -> str:
    try:
        if api_key:
            genai.configure(api_key=api_key)
        else:
            genai.configure(api_key=settings.GOOGLE_API_KEY)
            
        full_prompt = prompt
        if context:
            full_prompt = f"Context:\n{context}\n\nQuestion:\n{prompt}"
        
        # Re-instantiate model to ensure config applies if needed, though configure is global.
        # Ideally we'd use a client instance, but this works for simple use cases.
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(full_prompt)
        return response.text
    except Exception as e:
        return f"Error generating response: {str(e)}"
