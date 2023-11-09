import json
import numpy as np
import xarray as xr
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from typing import List

from starlette.responses import JSONResponse

from bact_bessyii_bluesky.applib.bba import measure_quad_response
from bact_analysis_bessyii.bba import app as bba_analysis
from bact_bessyii_bluesky.applib.bba.measurement_config import MeasurementConfig
from fastapi import APIRouter, Request, FastAPI
from pymongo import MongoClient

from .. import _pkg_files



app = FastAPI()
router = APIRouter()
# MongoDB connection
client = MongoClient("mongodb://127.0.0.1:27017/")  # Replace with your MongoDB connection string
db = client["bessyii"]  # Replace "mydatabase" with your desired database name
measurement_collection = db["measurements"]  # Collection to store the measurement_config

router = APIRouter()
#: todo needs clean up of import
import bact_bessyii_dashboard
templates = Jinja2Templates(directory=_pkg_files.joinpath("templates"))

@router.get("/", response_class=HTMLResponse)
async def index(request: Request):
    configuration_collection = db["configuration"]  # Collection to store the measurement_config
    configurations = list(configuration_collection.find(limit=100))

    # Convert the configurations data to JSON and pass it to the template
    configurations_json = json.dumps(configurations, default=str)

    name_list = [config["name"] for config in configurations]
    return templates.TemplateResponse("index.html", {"request": request, "sample_configurations": configurations_json, "configurations": name_list})


@router.get("/estimatedangles/{uid}/", response_description="Get estimated angles for a specific uid")
async def get_preprocessed_measurement(uid: str):
    preprocessed_measurement_collection = db["estimatedangles"]
    # Perform the findOne query
    preprocessed_measurement = preprocessed_measurement_collection.find_one({"uid": uid})

    # Check if the measurement was found
    if preprocessed_measurement:
        # Remove the 'uid' field from the measurement dictionary
        preprocessed_measurement.pop('uid', None)
        preprocessed_measurement.pop('_id', None)
        # Return the measurement as JSON response
        # return JSONResponse(content=preprocessed_measurement)
        return preprocessed_measurement
    # If measurement not found, return a 404 response
    return JSONResponse(status_code=404, content={"message": "Measurement not found"})



@router.get("/fitreadydata/{uid}/", response_description="Get bpm raw data for a specific uid")
async def get_preprocessed_measurement(uid: str):
    fit_ready_data_collection = db["fitreadydata"]
    # Perform the findOne query
    fit_ready_data = fit_ready_data_collection.find_one({"uid": uid})

    # Check if the measurement was found
    if fit_ready_data:
        # Remove the 'uid' field from the measurement dictionary
        fit_ready_data.pop('uid', None)
        fit_ready_data.pop('_id', None)
        # Return the measurement as JSON response
        # return JSONResponse(content=preprocessed_measurement)
        return fit_ready_data['per_magnet']
    # If measurement not found, return a 404 response
    return JSONResponse(status_code=404, content={"message": "fit ready data not found"})
@router.post('/measurements/', response_model=dict)
async def add_measurement(data: dict):
    #extract the input from post service
    prefix = data['prefix']
    currents = np.array(data['currents'])
    catalog_name = data['catalog_name']
    machine_name = data['machine_name']
    measurement_name = data['measurement_name']
    # Perform the measurement and return the uids
    uids =  measure_quad_response.main(prefix, currents,machine_name,catalog_name, measurement_name,try_run=True)

    # Create a MeasurementConfig object
    measurement_config = MeasurementConfig(
        prefix=prefix,
        currents=currents,
        catalog_name=catalog_name,
        machine_name=machine_name,
        measurement_name=measurement_name,
        uids=uids
    )
    print(f"Measurement completed with uid:{uids}")
    #call the bba analysis
    bba_analysis.main(uids[0])
    # Store the measurement configuration in MongoDB
    measurement_config.currents = measurement_config.currents.tolist()
    measurement_collection.insert_one(measurement_config.__dict__)
    # Return the uids as a response
    return {'uids': uids}


@router.get("/measurements", response_description="List all Measurements", response_model=List[MeasurementConfig])
def get_configurations(request: Request):
    configurations = list(request.app.database["measurements"].find(limit=100))
    return configurations