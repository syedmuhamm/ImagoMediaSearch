def test_search_by_fotograf(http_session, api_base_url):
    url = f"{api_base_url}/search/by-fotograf/"
    params = {"fotograf": "Eibner"}
    response = http_session.get(url, params=params)
    assert response.status_code == 200
    data = response.json()
    assert "results" in data
    assert all("Eibner" in item["fotografen"] for item in data["results"])

def test_search_by_invalid_fotograf(http_session, api_base_url):
    response = http_session.get(f"{api_base_url}/search/by-fotograf/", params={"fotografen": "asdfghjkl999"})
    assert response.status_code == 400, f"Expected 400 Bad Request for invalid fotografen, got {response.status_code}"
    # check error message structure:
    error_data = response.json()
    assert "error" in error_data or "detail" in error_data, "Expected error message in response"
