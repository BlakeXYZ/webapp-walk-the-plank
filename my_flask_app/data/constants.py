from enum import Enum

class RoomKeys(str, Enum):
    HOST = "host_username"
    USERS = "room_users"
    GAME_STATE = "game_state"
    GAME_DATA = "game_data" # (roles, timer settings, game mode, etc.)

#---

class UserKeys(str, Enum): # child of RoomKeys.USERS
    SID = "sid"
    USERNAME = "username"
    ROLE = "role"

class GameStates(str, Enum): # child of RoomKeys.GAME_STATE
    LOBBY = "lobby"
    IN_PROGRESS = "in_progress"
    FINISHED = "finished"

class GameData(str, Enum): # child of RoomKeys.GAME_DATA
    TIMER_SETTINGS = "timer_settings"
    GAME_MODE = "game_mode"
    MODE_DETAILS = "mode_details"


#---

class RoleKeys(str, Enum): # child of UserKeys.ROLE
    IMPOSTOR = "impostor"
    CREWMATE = "crewmate"

    #TODO: add more roles
    #TODO: spectator role for handling user joining mid-game/"IN_PROGRESS" state
    # DETECTIVE = "detective"
    # SPECTATOR = "spectator"

class GameModes(str, Enum): # child of GameData.GAME_MODE
    INTERROGATION = "interrogation"
    PASSWORDS = "passwords"
    STANDARD = "standard"

class ModeDetails(str, Enum): # child of GameData.MODE_DETAILS
    INSTRUCTIONS = "instructions"
    CATEGORY = "category"
    PASSWORD = "password"