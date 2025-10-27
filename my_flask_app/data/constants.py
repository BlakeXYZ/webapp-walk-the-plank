from enum import Enum

class RoomKeys(str, Enum):
    HOST = "host_username"
    USERS = "room_users"

class UserKeys(str, Enum):
    SID = "sid"
    USERNAME = "username"