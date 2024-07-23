from fastapi import FastAPI #, WebSocket
from fastapi.responses import HTMLResponse
from utils.wordle import WordleGame
from utils.models import CreateRoom, UpdateRoom
import logging, coloredlogs

logger = logging.getLogger(__name__)
coloredlogs.install(level='DEBUG', logger=logger)

APP_VERSION = "0.0.0"

app = FastAPI()

game = WordleGame()

@app.get("/")
async def get():
    return {
        "version": APP_VERSION
    }
    
@app.post("/create_room")
async def create_room(payload: CreateRoom):
    host_id, game_id = game.create_new_room(host_name=payload.host_name)
    return {
        "host_id": host_id, "game_id": game_id
    }


@app.get("/get_lobby")
async def create_room():
    return game.list_public_games()

@app.post("/update_room_settings")
async def create_room(payload: UpdateRoom):
    game_id, num_players, word_length = payload.game_id, payload.num_players, payload.word_length
    game.update_room_settings(game_id, num_players, word_length)
    return {
        "message": "Updated room settings"
    }