from elasticsearch8 import Elasticsearch
from elasticsearch8.exceptions import ConnectionError, TransportError
import logging

logger = logging.getLogger(__name__)

# Elasticsearch config
ES_HOST = 'https://5.75.227.63:9200'
ES_USER = 'elastic'
ES_PASS = 'rQQtbktwzFqAJS1h8YjP'
ES_INDEX = 'imago'

BASE_THUMBNAIL_URL = "https://www.imago-images.de/bild"

# Shared Elasticsearch client
es = Elasticsearch(
    ES_HOST,
    basic_auth=(ES_USER, ES_PASS),
    verify_certs=False,
    ssl_show_warn=False,
    headers={
        "Accept": "application/vnd.elasticsearch+json; compatible-with=8",
        "Content-Type": "application/vnd.elasticsearch+json; compatible-with=8",
    }
)

def search_media(query, page=1, page_size=10):
    """Search media documents by keyword query with pagination."""
    from_ = (page - 1) * page_size
    try:
        if not query or query == "*":
            body = {
                "query": {
                    "match_all": {}
                },
                "from": from_,
                "size": page_size
            }
        else:
            should_clauses = [
                {
                    "multi_match": {
                        "query": query,
                        "fields": ["suchtext^3", "fotografen"]
                    }
                }
            ]

            # If query is numeric, add exact match on bildnummer
            if query.isdigit():
                should_clauses.append({
                    "term": {
                        "bildnummer": int(query)
                    }
                })

            body = {
                "query": {
                    "bool": {
                        "should": should_clauses
                    }
                },
                "from": from_,
                "size": page_size
            }

        logger.debug(f"Elasticsearch query body: {body}")

        response = es.search(index=ES_INDEX, body=body)
        hits = response.get('hits', {}).get('hits', [])
        total = response.get('hits', {}).get('total', {}).get('value', 0)
        return hits, total

    except ConnectionError as ce:
        logger.error(f"Elasticsearch connection error: {ce}")
        return [], 0
    except TransportError as te:
        logger.error(f"Elasticsearch transport error: {te}")
        return [], 0
    except Exception as e:
        logger.error(f"Unexpected error during search: {e}")
        return [], 0
    
def build_thumbnail_url(db, bildnummer):
    # Pad bildnummer to 10 chars with leading zeros
    bildnummer_str = str(bildnummer).zfill(10)
    return f"{BASE_THUMBNAIL_URL}/{db}/{bildnummer_str}/s.jpg"

def normalize_hit(hit):
    source = hit.get('_source', {})
    # Handle missing fields with defaults
    db = source.get('db', 'st')  # default to 'st' if missing
    bildnummer = source.get('bildnummer', '0')
    
    # Build thumbnail URL
    thumbnail_url = build_thumbnail_url(db, bildnummer)
    
    # Include thumbnail URL in the result dict
    source['thumbnail_url'] = thumbnail_url
    
    return source