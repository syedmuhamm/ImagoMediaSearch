def test_general_search_returns_results(http_session, api_base_url):
    response = http_session.get(f"{api_base_url}/search/", params={"q": "Barcelona"})
    assert response.status_code == 200
    data = response.json()
    assert "results" in data
    assert isinstance(data["results"], list)
    assert len(data["results"]) > 0

def test_general_search_returns_no_results_for_gibberish(http_session, api_base_url):
    response = http_session.get(f"{api_base_url}/search/", params={"q": "asldkfjalskdfj1234567890"})
    assert response.status_code == 200, f"Status: {response.status_code}, Body: {response.text}"
    data = response.json()
    
    # Expecting no matches for gibberish
    assert "results" in data
    assert isinstance(data["results"], list)
    assert len(data["results"]) == 0, f"Expected no results, but got {len(data['results'])}"


def test_result_fields_structure(http_session, api_base_url):
    response = http_session.get(f"{api_base_url}/search/", params={"q": "Barcelona"})
    data = response.json()
    first = data["results"][0]
    expected_keys = {
        "bildnummer", "datum", "suchtext", "hoehe",
        "breite", "fotografen", "db", "thumbnail_url"
    }
    assert set(first.keys()) == expected_keys
    assert isinstance(first["bildnummer"], str)
    assert first["thumbnail_url"].startswith("https://")

def test_result_fields_structure_is_invalid_if_keys_missing():
    fake_result = {
        "bildnummer": "123456",
        "datum": "2024-01-01T00:00:00.000Z",
        "suchtext": "Sample",
        # Missing keys: hoehe, breite, fotografen, db, thumbnail_url
    }

    expected_keys = {
        "bildnummer", "datum", "suchtext", "hoehe",
        "breite", "fotografen", "db", "thumbnail_url"
    }

    missing_keys = expected_keys - set(fake_result.keys())

    assert missing_keys, "This should fail if required keys are missing"
    assert set(fake_result.keys()) != expected_keys, "Fake result should not match expected schema"


def test_query_filters_by_text(http_session, api_base_url):
    text = "FanParty"
    response = http_session.get(f"{api_base_url}/search/", params={"q": text})
    assert response.status_code == 200, f"Status: {response.status_code}, Body: {response.text}"
    results = response.json()["results"]
    print("Results suchtext samples:", [r["suchtext"][:50] for r in results])

    assert len(results) > 0, f"No results returned for query: {text}"

    matching = [r for r in results if text.lower() in (r.get("suchtext") or "").lower()]
    assert matching, f"No results contained '{text}' in their 'suchtext' field"

def test_query_filters_by_text_negative(http_session, api_base_url):
    text = "NoSuchEvent999"
    response = http_session.get(f"{api_base_url}/search/", params={"q": text})
    assert response.status_code == 200
    results = response.json()["results"]
    assert len(results) == 0, f"Expected 0 results for query '{text}', got: {len(results)}"
