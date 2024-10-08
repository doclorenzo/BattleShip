from django.shortcuts import render
#from django.http import HttpResponse
from django.views import View

def index(request):
    return render(request, "game/index.html")

class GamePrep(View):
    def post(self, request):
        return render(request, "game/gamePrep.html")