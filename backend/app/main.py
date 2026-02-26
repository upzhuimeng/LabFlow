from fastapi import FastAPI
import uvicorn

from app.core import envConfig

app = FastAPI(title="LabFlow", version="0.01.0")

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app", host=envConfig.HOST, port=envConfig.PORT, reload=envConfig.RELOAD
    )
