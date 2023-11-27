from fastapi import FastAPI, Request
from pymongo import MongoClient
from starlette.templating import Jinja2Templates

# from bact_bessyii_bluesky.applib.bba.api import router as api_router
from bact_bessyii_dashboard.controller.index_controller import router as api_router
import uvicorn
from fastapi import APIRouter
from fastapi.staticfiles import StaticFiles

from bact_bessyii_dashboard import _pkg_files
import os

from bact_bessyii_mls_ophyd.db.mongo_repository import InitializeMongo

os.chdir(_pkg_files.joinpath("."))

app = FastAPI()
static_path = _pkg_files.joinpath("static")
app.mount("/static", StaticFiles(directory=static_path), name="static")
templates = Jinja2Templates(directory=_pkg_files.joinpath("templates"))
db_init = InitializeMongo()
@app.on_event("startup")
def startup_db_client():
    app.db_init = db_init


@app.on_event("shutdown")
def shutdown_db_client():
    app.db_init.close_connnection()

app.include_router(api_router, tags=["measurements"], prefix="")

@app.get("/favicon.ico")
async def favicon():
    return ""

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
