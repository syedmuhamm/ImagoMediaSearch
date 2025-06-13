from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status, throttling, serializers
from .search_utils import execute_media_search
import logging

logger = logging.getLogger(__name__)


class MediaSearchParamsSerializer(serializers.Serializer):
    q = serializers.CharField(max_length=100)
    fotograf = serializers.CharField(required=False, allow_blank=True)
    datum_von = serializers.DateField(required=False)
    datum_bis = serializers.DateField(required=False)
    page = serializers.IntegerField(required=False, min_value=1, default=1)
    page_size = serializers.IntegerField(required=False, min_value=1, max_value=50, default=10)
    search_after = serializers.IntegerField(required=False)


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
            result = execute_media_search(
                query=params['q'],
                page=params['page'],
                page_size=params['page_size'],
                fotografen=params.get('fotograf') or None,
                datum_von=params.get('datum_von'),
                datum_bis=params.get('datum_bis'),
                search_after=params.get('search_after')
            )
            return Response(result, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Search failed: {str(e)}")
            return Response({'error': 'Failed to search media data.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
def search_by_fotograf(request):
    try:
        fotograf = request.GET.get("fotograf", "").strip()
        page = int(request.GET.get("page", 1))
        page_size = int(request.GET.get("page_size", 10))
        search_after = request.GET.get("search_after")

        result = execute_media_search(
            fotografen=fotograf,
            page=page,
            page_size=page_size,
            search_after=int(search_after) if search_after else None
        )
        return Response(result)

    except Exception as e:
        logger.error(f"Search by fotograf failed: {str(e)}")
        return Response({'error': 'Search by fotograf failed.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
def search_by_datum(request):
    try:
        datum_von = request.GET.get("datum_von")
        datum_bis = request.GET.get("datum_bis")
        page = int(request.GET.get("page", 1))
        page_size = int(request.GET.get("page_size", 10))
        search_after = request.GET.get("search_after")

        result = execute_media_search(
            datum_von=datum_von,
            datum_bis=datum_bis,
            page=page,
            page_size=page_size,
            search_after=int(search_after) if search_after else None
        )
        return Response(result)

    except Exception as e:
        logger.error(f"Search by datum failed: {str(e)}")
        return Response({'error': 'Search by datum failed.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
def search_by_bildnummer(request):
    try:
        bildnummer = request.GET.get("bildnummer")
        result = execute_media_search(
            bildnummer=bildnummer,
            page=1,
            page_size=1
        )
        return Response(result)

    except Exception as e:
        logger.error(f"Search by bildnummer failed: {str(e)}")
        return Response({'error': 'Search by bildnummer failed.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
