# media_api/views.py

from rest_framework.views import APIView
from rest_framework import throttling
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework import status
from .es_client import search_media  # ✅ Clean import
import logging

logger = logging.getLogger(__name__)

class MediaSearchPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50

class MediaSearchAPIView(APIView):
    throttle_classes = [throttling.AnonRateThrottle]

    def get(self, request):
        query = request.GET.get('q', '').strip()
        if not query:
            return Response({'error': 'Query parameter "q" is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if len(query) > 100:
            return Response({'error': 'Query parameter "q" is too long.'}, status=status.HTTP_400_BAD_REQUEST)

        paginator = MediaSearchPagination()
        page = request.GET.get(paginator.page_query_param, 1)
        page_size = request.GET.get(paginator.page_size_query_param, paginator.page_size)

        try:
            page = int(page)
            page_size = int(page_size)
            if page < 1:
                page = 1
            if page_size < 1 or page_size > paginator.max_page_size:
                page_size = paginator.page_size
        except ValueError:
            page = 1
            page_size = paginator.page_size

        try:
            # ✅ Use centralized search logic
            hits, total = search_media(query, page=page, page_size=page_size)
            results = [hit['_source'] for hit in hits]

            return Response({
                "count": total,
                "page": page,
                "page_size": page_size,
                "results": results
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Search failed: {str(e)}")
            return Response({'error': 'Failed to search media data.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
