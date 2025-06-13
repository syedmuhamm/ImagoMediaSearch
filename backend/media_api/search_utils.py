# media_api/search_utils.py

from .es_client import search_media, normalize_hit

def execute_media_search(
    query=None,
    page=1,
    page_size=10,
    fotografen=None,
    datum_von=None,
    datum_bis=None,
    bildnummer=None,
    search_after=None
):
    hits, total = search_media(
        query=query,
        page=page,
        page_size=page_size,
        fotografen=fotografen,
        datum_von=datum_von,
        datum_bis=datum_bis,
        bildnummer=bildnummer,
        search_after=search_after
    )

    results = [normalize_hit(hit) for hit in hits]
    
    # next_search_after is determined by the last hit's sort key,
    # and this should be returned even for the initial load or page-based queries.
    next_search_after = hits[-1]["sort"][0] if hits and "sort" in hits[-1] else None

    return {
        "count": total,
        "page": page,
        "page_size": page_size,
        "results": results,
        "next_search_after": next_search_after
    }
