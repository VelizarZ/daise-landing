from enum import StrEnum


class AppState(StrEnum):
    """Enums for Front end App State"""

    OFF = 'off'
    LOADING = 'loading'
    ON = 'on'
