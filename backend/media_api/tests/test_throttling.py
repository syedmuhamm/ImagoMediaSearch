import pytest
from django.urls import reverse
from django.core.cache import cache
from django.test.utils import override_settings
from rest_framework import status
from rest_framework.test import APIClient

# Override throttle settings for this test
THROTTLE_SETTINGS = {
    'DEFAULT_THROTTLE_CLASSES': ['rest_framework.throttling.AnonRateThrottle'],
    'DEFAULT_THROTTLE_RATES': {'anon': '2/second'},
}

@pytest.mark.django_db
@override_settings(REST_FRAMEWORK=THROTTLE_SETTINGS)
def test_anonymous_throttle_limits_reached():
    """
    Sends 3 requests to the media_search endpoint with a throttle limit of 2/sec.
    The third request should return 429 (Too Many Requests).
    """
    client = APIClient()
    cache.clear()
    url = reverse('media_search')

    # First 2 requests should succeed
    assert client.get(url).status_code == status.HTTP_200_OK
    assert client.get(url).status_code == status.HTTP_200_OK

    # Third request should be throttled
    response = client.get(url)
    assert response.status_code == status.HTTP_429_TOO_MANY_REQUESTS
    assert 'throttled' in response.data.get('detail', '').lower()
