# -*- coding: utf-8 -*-
"""User forms."""
from tokenize import String
from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField
from wtforms.validators import ValidationError, DataRequired, Optional, Length

from .models import User

import logging
logger = logging.getLogger(__name__)

class RegisterForm(FlaskForm):
    """Register form."""

    username = StringField("Username")
    roomcode = StringField("Room Code")
    join_room = SubmitField("Join Room")
    create_room = SubmitField("Create Room")
    active_rooms = StringField("Active Rooms")

    def __init__(self, *args, **kwargs):
        """Create instance."""
        super(RegisterForm, self).__init__(*args, **kwargs)
        self.user = None

    def validate(self, **kwargs):
        """Validate the form."""
        initial_validation = super(RegisterForm, self).validate()
        if not initial_validation:
            return False
        
        valid = True

        logger.debug(f"🛠️ ------------------ DEBUG: Starting custom validation for RegisterForm with data: {self.data}")

        self.username.data = self.username.data.strip()
        # ---- Username Validation ----
        if self.username.data:
            if len(self.username.data) < 3:
                self.username.errors.append("Username must be at least 3 characters long.")
                valid = False
            elif len(self.username.data) > 16:
                self.username.errors.append("Username cannot be longer than 16 characters.")
                valid = False
 

        # ---- Join Room Validation ----
        # TODO: Validate if Room Exists in DB
        if self.join_room.data:
            if not self.roomcode.data:
                self.roomcode.errors.append("Room code required to join a room.")
                valid = False
            elif len(self.roomcode.data) != 4:
                self.roomcode.errors.append("Room code must be 4 characters long.")
                valid = False
            elif self.roomcode.data not in self.active_rooms.data:
                self.roomcode.errors.append(f"A Room with code '{self.roomcode.data}' does not exist! Please check and try again.")
                valid = False
        logger.info(f"🛠️ DEBUG: Form validation result - initial: {initial_validation}, overall: {valid}")
        return initial_validation and valid

        
