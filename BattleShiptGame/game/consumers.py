import json
from channels.generic.websocket import WebsocketConsumer
from django.template.loader import render_to_string

class ShipConsumer(WebsocketConsumer):

    #shared between alla the instances
    Queue=''

    def connect(self):
        self.accept()
        msg=json.dumps({
            "type":"Connected"
        })
        self.send(text_data=msg)


    def receive(self, text_data):

        data_json=json.loads(text_data)

        if(data_json["type"]=="begin"):

            #if Queue empty, add player to queue
            if not ShipConsumer.Queue:
                self.name=data_json["name"]
                self.shipsLocation=data_json["ships"]
                ShipConsumer.Queue=self
                msg=json.dumps({
                "type":"Queue"
                })
                self.send(text_data=msg)
            
            #if queue not empty, create session
            else:

                #empty queue
                queuedPlayer=ShipConsumer.Queue
                ShipConsumer.Queue=''

                self.name=data_json["name"]
                self.shipsLocation=data_json["ships"]

                #send start message to both players to trigger js
                playingPagePlayer1 = render_to_string('game/playing.html', {"playerName": self.name, "opponentName": queuedPlayer.name})
                playingPagePlayer2 = render_to_string('game/playing.html', {"playerName": queuedPlayer.name , "opponentName": self.name})

                diz1={
                    "type": "Start",
                    "page": playingPagePlayer1
                }
                
                diz2={
                    "type": "Start",
                    "page": playingPagePlayer2
                }

                queuedPlayer.send(text_data=json.dumps(diz2))
                self.send(text_data=json.dumps(diz1))

                #set id sessions on both players
                self.idSession=str(self.name+queuedPlayer.name)
                queuedPlayer.idSession=self.idSession

                #set Opponent object on both players
                self.Opponent=queuedPlayer
                queuedPlayer.Opponent=self

                self.send(json.dumps({"type":"turn_on"}))
                self.Opponent.send(json.dumps({"type":"turn_off"}))
                self.turn=True
                self.Opponent.turn=False

                print("Player" + self.name + " point of view:")
                print(self.idSession)
                print(self.shipsLocation)
                print("Opponent:" + self.Opponent.name)

                print("Player" + queuedPlayer.name + " point of view:")
                print(queuedPlayer.idSession)
                print(queuedPlayer.shipsLocation)
                print("Opponent:" + queuedPlayer.Opponent.name)
            
        elif (data_json["type"]=="hit"):
            
            if self.turn:
                hit_cell=data_json["cell"]
                hit = False

                if(hit_cell in self.Opponent.shipsLocation):
                    
                    hit=True
                    self.Opponent.shipsLocation.remove(hit_cell)
                    
                    if not self.Opponent.shipsLocation:
                        self.send(text_data=json.dumps({"type":"win"}))
                        self.Opponent.send(text_data=json.dumps({"type":"lost"}))
                    
                self.Opponent.send(text_data=json.dumps({"type":"opponent_move", "cell": hit_cell, "hit": hit}))
                self.turn=False
                self.send(text_data=json.dumps({"type":"ack_hit", "cell":hit_cell, "hit": hit}))

                self.turn=False
                self.Opponent.turn=True
            
    def disconnect(self, code):
       msg=json.dumps({
           "type":"Disconnected"
       })

       self.Opponent.send(msg)




