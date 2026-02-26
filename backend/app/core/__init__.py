from .config import EnvConfig
from .exceptions import ConfigError

# 初始化配置
envConfig: EnvConfig = EnvConfig("DEV")
