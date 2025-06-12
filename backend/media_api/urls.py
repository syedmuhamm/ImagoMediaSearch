from django.urls import path
from .views import MediaSearchAPIView

urlpatterns = [
    path('api/media/search/', MediaSearchAPIView.as_view(), name='media_search'),
]
