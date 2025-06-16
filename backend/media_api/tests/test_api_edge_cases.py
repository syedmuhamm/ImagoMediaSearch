def test_method_not_allowed_on_search(http_session, api_base_url):
    response = http_session.post(f"{api_base_url}/search/", json={"q": "Berlin"})
    assert response.status_code == 405

def test_missing_query_param_returns_valid_response(http_session, api_base_url):
    response = http_session.get(f"{api_base_url}/search/")
    assert response.status_code == 200
    data = response.json()
    assert "results" in data
    assert isinstance(data["results"], list)

def test_malformed_query_param(http_session, api_base_url):
    response = http_session.get(f"{api_base_url}/search/", params={"q": 12345})
    assert response.status_code == 200
    data = response.json()
    assert "results" in data

def test_empty_query_string(http_session, api_base_url):
    response = http_session.get(f"{api_base_url}/search/", params={"q": ""})
    assert response.status_code == 200
    data = response.json()
    assert "results" in data
    assert isinstance(data["results"], list)

def test_date_range_same_start_and_end(http_session, api_base_url):
    response = http_session.get(f"{api_base_url}/search/", params={"datum_von": "2000-01-01", "datum_bis": "2000-01-01"})
    assert response.status_code == 200
    assert "results" in response.json()

def test_invalid_date_format(http_session, api_base_url):
    response = http_session.get(f"{api_base_url}/search/", params={"datum_von": "01-01-2000"})
    assert response.status_code in (400, 422, 500), f"Expected error status, got {response.status_code}"

def test_search_by_fotograf_case_insensitive(http_session, api_base_url):
    response_lower = http_session.get(f"{api_base_url}/search/", params={"fotograf": "meier"})
    response_upper = http_session.get(f"{api_base_url}/search/", params={"fotograf": "MEIER"})
    assert response_lower.status_code == 200 and response_upper.status_code == 200
    assert response_lower.json()["results"] == response_upper.json()["results"]

def test_public_access_allowed_without_auth(http_session, api_base_url):
    """
    Since the API does not currently require authentication, 
    this test ensures that public access is functioning as expected.
    """
    response = http_session.get(f"{api_base_url}/search/", params={"q": "Barcelona"})
    assert response.status_code == 200
    data = response.json()
    assert "results" in data

def test_large_result_set_does_not_crash(http_session, api_base_url):
    response = http_session.get(f"{api_base_url}/search/", params={"q": "der"})
    assert response.status_code == 200
    data = response.json()
    assert "results" in data
    assert isinstance(data["results"], list)
    assert len(data["results"]) <= 10000