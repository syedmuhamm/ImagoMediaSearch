from .es_client import search_media, normalize_hit
import logging

logger = logging.getLogger(__name__)

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
    next_search_after = hits[-1]["sort"] if hits and "sort" in hits[-1] else None

    # 🔍 DEBUG LOGGING
    logger.debug("-------- Elasticsearch Scroll Debug --------")
    logger.debug("Current page: %s", page)
    logger.debug("Search after received: %s", search_after)
    logger.debug("Next search_after to return: %s", next_search_after)
    logger.debug("Number of results returned: %s", len(results))
    logger.debug("-------------------------------------------")

    return {
        "count": total,
        "page": page,
        "page_size": page_size,
        "results": results,
        "next_search_after": next_search_after
    }
