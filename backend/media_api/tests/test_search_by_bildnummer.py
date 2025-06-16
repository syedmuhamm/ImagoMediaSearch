def test_search_by_bildnummer(http_session, api_base_url):
    url = f"{api_base_url}/search/by-bildnummer/"
    params = {"bildnummer": "7914100"}
    response = http_session.get(url, params=params)
    assert response.status_code == 200
    data = response.json()
    assert "results" in data
    assert any(item["bildnummer"] == "7914100" for item in data["results"])

def test_search_by_bildnummer_returns_no_results_for_invalid_number(http_session, api_base_url):
    url = f"{api_base_url}/search/by-bildnummer/"
    params = {"bildnummer": "0000000"}
    response = http_session.get(url, params=params)

    assert response.status_code == 200, f"Status: {response.status_code}, Body: {response.text}"
    data = response.json()
    assert "results" in data
    assert all(item["bildnummer"] != "0000000" for item in data["results"]), (
        "Expected no results to match bildnummer '0000000'"
    )
