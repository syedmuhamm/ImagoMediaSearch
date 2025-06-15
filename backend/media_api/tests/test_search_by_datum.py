def test_search_by_datum(http_session, api_base_url):
    url = f"{api_base_url}/search/by-datum/"
    params = {"datum_von": "2011-05-15", "datum_bis": "2011-05-21"}
    response = http_session.get(url, params=params)
    assert response.status_code == 200
    data = response.json()
    assert "results" in data
    for item in data["results"]:
        assert "2011-05-15" <= item["datum"][:10] <= "2011-05-21"

def test_search_by_datum_returns_no_results_for_empty_range(http_session, api_base_url):
    url = f"{api_base_url}/search/by-datum/"
    
    # Pick an unrealistic historical range (e.g., before your dataset begins)
    params = {"datum_von": "2042-01-01", "datum_bis": "2042-01-05"}
    response = http_session.get(url, params=params)
    
    assert response.status_code == 200, f"Status: {response.status_code}, Body: {response.text}"
    data = response.json()
    
    assert "results" in data
    assert len(data["results"]) == 0, (
        f"Expected no results for date range 2042-01-01 to 2042-01-05, but got {len(data['results'])}"
    )
