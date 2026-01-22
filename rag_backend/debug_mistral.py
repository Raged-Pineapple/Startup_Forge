import os
from mistralai import Mistral
from dotenv import load_dotenv

load_dotenv()

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
print(os.getenv("MISTRAL_API_KEY"))

print("-" * 30)
if not MISTRAL_API_KEY:
    print("❌ Error: MISTRAL_API_KEY not found in environment.")
else:
    masked = MISTRAL_API_KEY[:4] + "*" * (len(MISTRAL_API_KEY) - 4)
    print(f"✅ Key found: {masked}")

    try:
        print("Testing connection to Mistral API...")
        client = Mistral(api_key=MISTRAL_API_KEY)
        response = client.chat.complete(
            model="mistral-small-latest",
            messages=[{"role": "user", "content": "Hello"}]
        )
        print(f"✅ Success! Response: {response.choices[0].message.content}")
    except Exception as e:
        print(f"❌ API Call Failed: {e}")
print("-" * 30)
