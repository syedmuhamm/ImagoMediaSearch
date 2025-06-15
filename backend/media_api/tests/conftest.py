import os
import urllib3
import pytest
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Suppress SSL warnings globally (for self-signed certs)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

@pytest.fixture(scope="session")
def api_base_url():
    return os.getenv("API_BASE_URL", "https://localhost:8000/api/media")

@pytest.fixture(scope="session")
def verify_ssl():
    return os.getenv("VERIFY_SSL", "false").lower() == "true"

@pytest.fixture(scope="session")
def http_session(verify_ssl):
    import requests
    session = requests.Session()
    session.verify = verify_ssl
    return session
