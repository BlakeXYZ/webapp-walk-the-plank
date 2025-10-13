# -*- coding: utf-8 -*-
"""User forms."""
from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField
from wtforms.validators import ValidationError, DataRequired, Optional, Length

from .models import User

import logging
logger = logging.getLogger(__name__)

class RegisterForm(FlaskForm):
    """Register form."""

    username = StringField(
        "Username", validators=[DataRequired(), Length(min=3, max=25)]
    )

    roomcode = StringField("Room Code")
    join_room = SubmitField("Join Room")
    create_room = SubmitField("Create Room")

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

        # ---- Join Room Validation ----
        # TODO: Validate if Room Exists in DB
        if self.join_room.data:
            if not self.roomcode.data:
                self.roomcode.errors.append("Room code required to join a room.")
                valid = False
            elif len(self.roomcode.data) != 4:
                self.roomcode.errors.append("Room code must be 4 characters long.")
                valid = False


        return initial_validation and valid

        
