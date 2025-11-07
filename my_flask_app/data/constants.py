from enum import Enum

class RoomKeys(str, Enum):
    HOST = "host_username"
    USERS = "room_users"
    GAME_STATE = "game_state"
    GAME_DATA = "game_data" # (roles, timer settings, game mode, etc.)

class UserKeys(str, Enum):
    SID = "sid"
    USERNAME = "username"

class GameStates(str, Enum):
    LOBBY = "lobby"
    IN_PROGRESS = "in_progress"
    FINISHED = "finished"

