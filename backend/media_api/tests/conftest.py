import os
import pytest
import urllib3
import requests
from dotenv import load_dotenv
from django.core.cache import cache
from django.test.utils import override_settings

# Load environment variables
load_dotenv()

# Suppress SSL warnings for local/insecure testing
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Constants
NO_THROTTLE_SETTINGS = {
    'DEFAULT_THROTTLE_CLASSES': [],
    'DEFAULT_THROTTLE_RATES': {},
}

@pytest.fixture(scope="session")
def api_base_url():
    """Returns the base URL for the media API."""
    return os.getenv("API_BASE_URL", "https://localhost:8000/api/media")

@pytest.fixture(scope="session")
def verify_ssl():
    """Determines whether SSL verification is enabled."""
    return os.getenv("VERIFY_SSL", "false").lower() == "true"

@pytest.fixture(scope="session")
def http_session(verify_ssl):
    """Returns a configured HTTP session for integration tests."""
    session = requests.Session()
    session.verify = verify_ssl
    return session

@pytest.fixture(autouse=True)
def clear_cache_before_test():
    """Clears Django cache before each test."""
    cache.clear()
    yield

@pytest.fixture
def disable_throttling():
    """Temporarily disables DRF throttling for a test."""
    with override_settings(REST_FRAMEWORK=NO_THROTTLE_SETTINGS):
        yield
