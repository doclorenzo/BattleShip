from django.shortcuts import render
from django.http import HttpResponse
from django.views import View
# Create your views here.

def index(request):
    return render(request, "game/index.html")

class GamePrep(View):
    def post(self, request):
        return render(request, "game/include/table.html")