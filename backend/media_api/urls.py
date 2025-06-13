from django.urls import path
from .views import (
    MediaSearchAPIView,
    search_by_fotograf,
    search_by_datum,
    search_by_bildnummer,
)

urlpatterns = [
    path('search/', MediaSearchAPIView.as_view(), name='media_search'),
    path('search/by-fotograf/', search_by_fotograf, name='media_search_by_fotograf'),
    path('search/by-datum/', search_by_datum, name='media_search_by_datum'),
    path('search/by-bildnummer/', search_by_bildnummer, name='media_search_by_bildnummer'),
]
