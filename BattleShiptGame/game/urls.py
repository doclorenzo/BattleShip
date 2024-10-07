from . import views
from django.urls import path

urlpatterns = [
    path('', views.index, name='home_page'),
    path('gamestart', views.GamePrep.as_view(), name='second_page')
]
