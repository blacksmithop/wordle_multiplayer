from utils.models import Player, Game, Lobby
from uuid import uuid4
import logging

logger = logging.getLogger(__name__)

def get_unique_id():
    return uuid4().hex[:5]


class WordleGame:
    def __init__(self):
        self.lobby = Lobby(games=[])

    def select_word_for_game(self):
        def select(word_length: str):
            raise NotImplementedError()

        return select(self.word_length)

    def update_player_scores(self):
        raise NotImplementedError()

    def update_host(self, game_id: str, host_id: str):
        game: Game = [room for room in self.lobby.games if room.game_id == game_id][0]
        host: Player = [player for player in game.players if player.is_host == True][0]
        new_host: Player = [player for player in game.players if player.host_id == host_id][0]
        if host.player_id == host_id:
            return
        host.is_host = False
        new_host.is_host = True
        
    def start_new_round(self):
        raise NotImplementedError()

    def create_new_room(self, host_name: str):
        game_id, host_id = get_unique_id(), get_unique_id()
        host = Player(name=host_name, player_id=host_id, is_host=True)
        room = Game(players=[host], game_id=game_id)
        self.lobby.games.append(room)
        logger.error(f"Created new room #{game_id} with host {host_name}({host_id})")
        return host_id, game_id

    def list_public_games(self):
        public_games = [game for game in self.lobby.games if not game.private]
        return public_games

    def update_room_settings(
        self, game_id: str, num_players: int = 1, word_length: int = 5
    ):
        game: Game = [room for room in self.lobby.games if room.game_id == game_id][0]
        game.num_players = num_players
        game.word_length = word_length
        return True

    def end_game(self):
        raise NotImplementedError()
