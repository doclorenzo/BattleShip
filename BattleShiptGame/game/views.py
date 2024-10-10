from django.shortcuts import render
from django.shortcuts import redirect
from django.views import View
import json

def index(request):
    return render(request, "game/index.html")


class GamePrep(View):
    def post(self, request):
        playerName=request.POST["username"]
        return render(request, "game/gamePrep.html", {
            "playerName":playerName
        })
    


class Playing(View):

    def get(self, request):
        return render(request, "game/playing.html")

    def post(self, request):
        data = json.loads(request.body)
        print(data)
        return redirect("playing_page")