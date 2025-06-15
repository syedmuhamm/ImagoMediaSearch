from elasticsearch8 import Elasticsearch
from elasticsearch8.exceptions import ConnectionError, TransportError
import logging
import urllib3
import os
from dotenv import load_dotenv


urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
logger = logging.getLogger(__name__)
load_dotenv()

ES_HOST = os.getenv("ES_HOST")
ES_USER = os.getenv("ES_USER")
ES_PASS = os.getenv("ES_PASS")
ES_INDEX = os.getenv("ES_INDEX")
BASE_THUMBNAIL_URL = os.getenv("BASE_THUMBNAIL_URL")

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

#Query Builders

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
        if len(fotografen) == 1:
            filter_.append({"term": {"fotografen": fotografen[0]}})
        else:
            filter_.append({"terms": {"fotografen": fotografen}})


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

# Search Handle

def search_media(query=None, page=1, page_size=10, fotografen=None,
                 datum_von=None, datum_bis=None, bildnummer=None,
                 search_after=None):
    try:
        query_body = build_query(query, fotografen, datum_von, datum_bis, bildnummer)

        # Sort by `bildnummer` and `db` to ensure uniqueness for search_after
        query_body["sort"] = [
            {"bildnummer": "desc"},
            {"db": "asc"}
        ]

        if search_after is not None:
            query_body["search_after"] = search_after if isinstance(search_after, list) else [search_after]
        else:
            from_ = (page - 1) * page_size
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
