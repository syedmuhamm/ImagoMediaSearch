from elasticsearch8 import Elasticsearch
from elasticsearch8.exceptions import ConnectionError, TransportError
import logging

logger = logging.getLogger(__name__)

ES_HOST = 'https://5.75.227.63:9200'
ES_USER = 'elastic'
ES_PASS = 'rQQtbktwzFqAJS1h8YjP'
ES_INDEX = 'imago'
BASE_THUMBNAIL_URL = "https://www.imago-images.de/bild"

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

def build_thumbnail_url(db, bildnummer):
    bildnummer_str = str(bildnummer).zfill(10)
    return f"{BASE_THUMBNAIL_URL}/{db}/{bildnummer_str}/s.jpg"

def normalize_hit(hit):
    source = hit.get('_source', {})
    db = source.get('db', 'st')
    bildnummer = source.get('bildnummer', '0')
    source['thumbnail_url'] = build_thumbnail_url(db, bildnummer)
    return source

# ========== Query Builders ==========

def build_query(query=None, fotografen=None, datum_von=None, datum_bis=None, bildnummer=None):
    must = []
    filter_ = []

    if bildnummer:
        must.append({
            "term": {
                "bildnummer": int(bildnummer)
            }
        })
    elif query and query != "*":
        must.append({
            "multi_match": {
                "query": query,
                "fields": ["suchtext^3", "fotografen"]
            }
        })

    if fotografen:
        filter_.append({
            "term": {
                "fotografen": fotografen
            }
        })

    if datum_von or datum_bis:
        range_filter = {}
        if datum_von:
            range_filter["gte"] = datum_von
        if datum_bis:
            range_filter["lte"] = datum_bis
        filter_.append({
            "range": {
                "datum": range_filter
            }
        })

    query_body = {
        "query": {
            "bool": {
                "must": must,
                "filter": filter_
            }
        }
    }
    return query_body

# ========== Search Handler ==========

def search_media(query=None, page=1, page_size=10, fotografen=None, datum_von=None, datum_bis=None, bildnummer=None):
    from_ = (page - 1) * page_size
    try:
        query_body = build_query(query, fotografen, datum_von, datum_bis, bildnummer)
        query_body["from"] = from_
        query_body["size"] = page_size

        logger.debug(f"ES Query: {query_body}")

        response = es.search(index=ES_INDEX, body=query_body)
        hits = response.get('hits', {}).get('hits', [])
        total = response.get('hits', {}).get('total', {}).get('value', 0)

        return hits, total
    except (ConnectionError, TransportError) as e:
        logger.error(f"Elasticsearch error: {e}")
        return [], 0
    except Exception as e:
        logger.error(f"Unexpected error during search: {e}")
        return [], 0
