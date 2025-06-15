import json

def test_pagination_page_1_and_2_different(http_session, api_base_url):
    url = f"{api_base_url}/search/"
    params_1 = {"q": "Barcelona", "page": 1}
    params_2 = {"q": "Barcelona", "page": 2}

    res1 = http_session.get(url, params=params_1).json()
    res2 = http_session.get(url, params=params_2).json()

    ids_1 = [r["bildnummer"] for r in res1["results"]]
    ids_2 = [r["bildnummer"] for r in res2["results"]]

    assert ids_1 != ids_2
    assert len(ids_1) > 0 and len(ids_2) > 0

def test_pagination_same_page_consistency(http_session, api_base_url):
    params = {"q": "Barcelona", "page": 1, "page_size": 5}
    page1 = http_session.get(f"{api_base_url}/search/", params=params).json()
    page1_repeat = http_session.get(f"{api_base_url}/search/", params=params).json()
    assert page1["results"] == page1_repeat["results"]


def test_search_after_consistency(http_session, api_base_url):
    url = f"{api_base_url}/search/"
    params_1 = {"q": "Barcelona", "page_size": 5}
    
    response1 = http_session.get(url, params=params_1)
    assert response1.status_code == 200, f"Status: {response1.status_code}, Body: {response1.text}"
    res1 = response1.json()
    results1 = res1.get("results", [])
    sa = res1.get("next_search_after")

    assert results1, "No results in first page"
    assert isinstance(sa, list), f"'next_search_after' is missing or not a list: {sa}"

    # Convert search_after to JSON string
    params_2 = {
        "q": "Barcelona",
        "page_size": 5,
        "search_after": json.dumps(sa)
    }

    response2 = http_session.get(url, params=params_2)
    assert response2.status_code == 200, f"Status: {response2.status_code}, Body: {response2.text}"
    res2 = response2.json()
    results2 = res2.get("results", [])

    assert results2, "No results in second page"
    assert results1[0]["bildnummer"] != results2[0]["bildnummer"], (
        "Pagination did not advance — same first result:\n"
        f"Page 1: {results1[0]['bildnummer']}, Page 2: {results2[0]['bildnummer']}"
    )

def test_search_after_reusing_same_value_does_not_repeat_first_result(http_session, api_base_url):
    url = f"{api_base_url}/search/"
    params = {"q": "Barcelona", "page_size": 5}

    response1 = http_session.get(url, params=params)
    assert response1.status_code == 200
    res1 = response1.json()
    results1 = res1.get("results", [])
    sa = res1.get("next_search_after")

    assert results1, "No results in first page"
    assert sa, "Missing search_after in first response"

    response2 = http_session.get(url, params={
        "q": "Barcelona",
        "page_size": 5,
        "search_after": json.dumps(sa)
    })
    assert response2.status_code == 200
    res2 = response2.json()
    results2 = res2.get("results", [])

    # Validate that pagination advanced
    assert results1[0]["bildnummer"] != results2[0]["bildnummer"], (
        "Pagination did not advance — same first result across pages"
    )

def test_search_after_with_invalid_value(http_session, api_base_url):
    url = f"{api_base_url}/search/"
    params = {
        "q": "Barcelona",
        "page_size": 5,
        "search_after": "not-a-valid-json-array"
    }

    response = http_session.get(url, params=params)
    
    # It should return a 400 Bad Request because search_after must be a valid JSON array
    assert response.status_code == 400, (
        f"Expected 400 for invalid 'search_after', got {response.status_code}. "
        f"Body: {response.text}"
    )

def test_search_after_with_malformed_json_array(http_session, api_base_url):
    url = f"{api_base_url}/search/"
    
    # Valid JSON, but semantically invalid: e.g., a single string instead of expected sort values
    bad_search_after = json.dumps(["INVALID_STRING_ONLY"])

    response = http_session.get(url, params={
        "q": "Barcelona",
        "page_size": 5,
        "search_after": bad_search_after
    })

    # Intentionally incorrect assumption: this should pass if the server *doesn't* validate properly
    assert response.status_code == 200, (
        "Expected invalid search_after to succeed — this test should FAIL if validation works"
    )
