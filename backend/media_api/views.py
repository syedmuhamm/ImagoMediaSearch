import logging
from datetime import datetime

from rest_framework.views import APIView
from rest_framework.decorators import api_view, throttle_classes
from rest_framework.response import Response
from rest_framework import status, serializers
from rest_framework.throttling import AnonRateThrottle

from .search_utils import execute_media_search

logger = logging.getLogger(__name__)

import json

def parse_search_after_param(param):
    import json
    try:
        parsed = json.loads(param)
        if isinstance(parsed, list):
            return parsed
        else:
            return [parsed]
    except Exception:
        # Fallback: treat as string
        return [param]


class MediaSearchParamsSerializer(serializers.Serializer):
    q = serializers.CharField(required=False, allow_blank=True)
    page = serializers.IntegerField(required=False, default=1)
    page_size = serializers.IntegerField(required=False, default=10)
    fotograf = serializers.ListField(child=serializers.CharField(), required=False)
    datum = serializers.DateField(required=False)
    datum_von = serializers.DateField(required=False)
    datum_bis = serializers.DateField(required=False)
    bildnummer = serializers.CharField(required=False)
    search_after = serializers.JSONField(required=False)

    def validate(self, data):
        if 'datum' in data:
            data['datum_von'] = data['datum']
            data['datum_bis'] = data['datum']
        return data

class MediaSearchAPIView(APIView):
    throttle_classes = [AnonRateThrottle]

    def get(self, request):
        serializer = MediaSearchParamsSerializer(data=request.GET)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        params = serializer.validated_data

        # Validate that datum_von <= datum_bis if both present
        if params.get('datum_von') and params.get('datum_bis'):
            if params['datum_von'] > params['datum_bis']:
                return Response(
                    {'error': '"datum_von" must be before or equal to "datum_bis".'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        try:
            raw_search_after = request.GET.get("search_after")
            search_after = parse_search_after_param(raw_search_after) if raw_search_after else None

            query = params.get('q', '')
            datum_von = params.get('datum_von')
            datum_bis = params.get('datum_bis')

            # ✨ 1. Try to interpret q as a date string (YYYY-MM-DD)
            from datetime import datetime

            is_date_query = False
            is_bildnummer_query = False

            try:
                parsed_date = datetime.strptime(query, "%Y-%m-%d").date()
                datum_von = datum_bis = parsed_date
                is_date_query = True
            except ValueError:
                pass

            # ✨ 2. Try to interpret q as a bildnummer (exact number match)
            if query.isdigit():
                is_bildnummer_query = True

            # ✨ 3. Run search depending on type
            if is_bildnummer_query:
                result = execute_media_search(
                    bildnummer=query,
                    page=params['page'],
                    page_size=params['page_size'],
                    search_after=search_after
                )

            elif is_date_query:
                result = execute_media_search(
                    datum_von=datum_von,
                    datum_bis=datum_bis,
                    page=params['page'],
                    page_size=params['page_size'],
                    search_after=search_after
                )

            else:
                result = execute_media_search(
                    query=query,
                    fotografen=params.get('fotograf') or None,
                    datum_von=datum_von,
                    datum_bis=datum_bis,
                    page=params['page'],
                    page_size=params['page_size'],
                    search_after=search_after
                )

            return Response(result, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Search failed: {str(e)}")
            return Response({'error': 'Failed to search media data.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@throttle_classes([AnonRateThrottle])
def search_by_fotograf(request):
    fotograf = request.GET.get("fotograf")
    page = int(request.GET.get("page", 1))
    page_size = int(request.GET.get("page_size", 10))

    raw_search_after = request.GET.get("search_after")
    search_after = None
    if raw_search_after:
        try:
            search_after = json.loads(raw_search_after)
            if not isinstance(search_after, list):
                search_after = [search_after]
        except json.JSONDecodeError:
            search_after = [raw_search_after]

    if not fotograf:
        return Response({"error": "Missing fotograf parameter"}, status=400)

    try:
        results = execute_media_search(
            page=page,
            page_size=page_size,
            fotografen=[fotograf],  # ✅ Must be a list
            search_after=search_after
        )
        return Response(results)
    except Exception as e:
        logger.exception("Error in search_by_fotograf:")
        return Response({"error": str(e)}, status=500)

@api_view(["GET"])
@throttle_classes([AnonRateThrottle])
def search_by_datum(request):
    try:
        datum_von_raw = request.GET.get("datum_von")
        datum_bis_raw = request.GET.get("datum_bis")
        page = int(request.GET.get("page", 1))
        page_size = int(request.GET.get("page_size", 10))
        raw_search_after = request.GET.get("search_after")

        search_after = parse_search_after_param(raw_search_after) if raw_search_after else None

        # Parse dates
        datum_von = datetime.strptime(datum_von_raw, "%Y-%m-%d").date() if datum_von_raw else None
        datum_bis = datetime.strptime(datum_bis_raw, "%Y-%m-%d").date() if datum_bis_raw else None

        # Validate date range
        if datum_von and datum_bis and datum_von > datum_bis:
            return Response({"error": '"datum_von" must be before or equal to "datum_bis".'}, status=400)

        result = execute_media_search(
            datum_von=datum_von,
            datum_bis=datum_bis,
            page=page,
            page_size=page_size,
            search_after=search_after
        )

        return Response(result)

    except Exception as e:
        logger.exception("Search by datum failed:")
        return Response({'error': 'Search by datum failed.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET"])
@throttle_classes([AnonRateThrottle])
def search_by_bildnummer(request):
    bildnummer = request.GET.get("bildnummer")
    if not bildnummer:
        return Response({"error": "Missing bildnummer parameter"}, status=400)

    try:
        result = execute_media_search(
            bildnummer=bildnummer,
            page=1,
            page_size=1,
            search_after=None
        )

        results = result.get("results", [])
        count = result.get("count", len(results))
        page = result.get("page", 1)
        next_search_after = result.get("next_search_after", None)

        if not results:
            return Response({"results": [], "count": 0, "page": page, "next_search_after": None})

        # Wrap results in the expected response format
        response_data = {
            "results": results,  # array, even if one item
            "count": count,
            "page": page,
            "next_search_after": next_search_after
        }

        return Response(response_data)

    except Exception as e:
        logger.error(f"Search by bildnummer failed: {str(e)}")
        return Response({'error': 'Search by bildnummer failed.'}, status=500)