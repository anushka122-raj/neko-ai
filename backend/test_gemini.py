import os
from dotenv import load_dotenv
from google import genai

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

response = client.models.generate_content(
    model="models/gemini-flash-latest",  # ✅ use a supported model
    contents="Hello Gemini, test message."
)

print(response.text)
