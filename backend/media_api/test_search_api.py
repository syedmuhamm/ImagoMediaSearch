from django.urls import reverse
from rest_framework.test import APIClient
import pytest

client = APIClient()

@pytest.mark.django_db
def test_general_search_text():
    response = client.get("/api/media/search/?q=berlin&page=1&page_size=5")
    assert response.status_code == 200
    assert "results" in response.data

@pytest.mark.django_db
def test_search_by_bildnummer():
    response = client.get("/api/media/search/by-bildnummer/?bildnummer=123456")
    assert response.status_code == 200
    assert "results" in response.data

@pytest.mark.django_db
def test_search_by_fotograf():
    response = client.get("/api/media/search/by-fotograf/?fotograf=Meier&page=1")
    assert response.status_code == 200
    assert "results" in response.data

@pytest.mark.django_db
def test_search_by_datum():
    response = client.get("/api/media/search/by-datum/?datum_von=2020-01-01&datum_bis=2020-12-31&page=1")
    assert response.status_code == 200
    assert "results" in response.data

@pytest.mark.django_db
def test_invalid_date_range():
    response = client.get("/api/media/search/by-datum/?datum_von=2022-01-01&datum_bis=2020-01-01")
    assert response.status_code == 400
