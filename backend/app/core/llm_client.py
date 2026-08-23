import requests
import json
from app.core.config import Config

class GroqClient:
    def __init__(self):
        self.api_key = Config.GROQ_API_KEY
        self.url = "https://api.groq.com/openai/v1/chat/completions"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
    def call_chat_completion(self, messages, response_json: bool = False, temperature: float = 0.0):
        """
        Executes a chat completion call to the Groq API.
        If response_json is True, forces JSON mode (requires JSON instruction in prompt).
        """
        payload = {
            "model": Config.MODEL_NAME,
            "messages": messages,
            "temperature": temperature
        }
        if response_json:
            payload["response_format"] = {"type": "json_object"}
            
        try:
            r = requests.post(self.url, headers=self.headers, json=payload, timeout=30)
            r.raise_for_status()
            data = r.json()
            return data["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"Error calling Groq API: {e}")
            # Log response body for details if possible
            if 'r' in locals() and hasattr(r, 'text'):
                print(f"Groq API error response: {r.text}")
            raise e
