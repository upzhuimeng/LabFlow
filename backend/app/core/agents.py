import os
from .validators import Validator

class AgentSetting:
    def __init__(self):
        self.AGENT_MODEL_NAME:str = Validator.str_validator("AGENT_MODEL_NAME",os.getenv("AGENT_MODEL_NAME","Qwen 3.5"))
        self.AGENT_API:str=Validator.str_validator("AGENT_API",os.getenv("AGENT_API"))
        self.AGENT_API_KEY:str = Validator.str_validator("AGENT_API_KEY",os.getenv("AGENT_API_KEY"))