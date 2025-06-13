# media_api/views.py

from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework import throttling
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework import status, throttling, serializers
from .es_client import search_media, normalize_hit
import logging

logger = logging.getLogger(__name__)

class MediaSearchPagination:
    # simplified pagination params, you can import your own paginator if needed
    page_query_param = 'page'
    page_size_query_param = 'page_size'
    page_size = 10
    max_page_size = 50

class MediaSearchParamsSerializer(serializers.Serializer):
    q = serializers.CharField(max_length=100)
    fotograf = serializers.CharField(required=False, allow_blank=True)
    datum_von = serializers.DateField(required=False)
    datum_bis = serializers.DateField(required=False)
    page = serializers.IntegerField(required=False, min_value=1, default=1)
    page_size = serializers.IntegerField(required=False, min_value=1, max_value=50, default=10)

class MediaSearchAPIView(APIView):
    throttle_classes = [throttling.AnonRateThrottle]

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
            hits, total = search_media(
                query=params['q'],
                page=params['page'],
                page_size=params['page_size'],
                fotografen=params.get('fotograf') or None,
                datum_von=params.get('datum_von'),
                datum_bis=params.get('datum_bis'),
            )
            results = [normalize_hit(hit) for hit in hits]

            return Response({
                "count": total,
                "page": params['page'],
                "page_size": params['page_size'],
                "results": results
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Search failed: {str(e)}")
            return Response({'error': 'Failed to search media data.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
# ✅ Search by photographer only
@api_view(["GET"])
def search_by_fotograf(request):
    fotograf = request.GET.get("fotograf", "").strip()
    page = int(request.GET.get("page", 1))
    hits, total = search_media(fotografen=fotograf, page=page)
    results = [normalize_hit(h) for h in hits]
    return Response({
        "count": total,
        "page": page,
        "results": results
    })


# ✅ Search by date range only
@api_view(["GET"])
def search_by_datum(request):
    datum_von = request.GET.get("datum_von")
    datum_bis = request.GET.get("datum_bis")
    page = int(request.GET.get("page", 1))
    hits, total = search_media(datum_von=datum_von, datum_bis=datum_bis, page=page)
    results = [normalize_hit(h) for h in hits]
    return Response({
        "count": total,
        "page": page,
        "results": results
    })


# ✅ Search by bildnummer
@api_view(["GET"])
def search_by_bildnummer(request):
    bildnummer = request.GET.get("bildnummer")
    hits, total = search_media(bildnummer=bildnummer, page=1, page_size=1)
    results = [normalize_hit(h) for h in hits]
    return Response({
        "count": total,
        "results": results
    })