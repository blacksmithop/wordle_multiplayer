from pydantic import BaseModel
from typing import List
from enum import Enum

# Server
class CreateRoom(BaseModel):
    host_name: str
    
class UpdateRoom(BaseModel):
    game_id: str
    num_players: int = 1
    word_length: int = 5
    
# Game

class Validity(Enum):
    correct: 0
    invalid: 1
    misplaced: 2
    absent: 3

class Guess(BaseModel):
    num_guess: int = 0
    

class Player(BaseModel):
    name: str
    player_id: str
    score: int = 0
    is_host: bool = False
    guess: List[Guess] = []
    
    
class Game(BaseModel):
    num_players: int = 1
    word_length: int = 5
    players: List[Player] = []
    game_id: str
    word: str = None
    private: bool = False
    
class Lobby(BaseModel):
    games: List[Game] = []