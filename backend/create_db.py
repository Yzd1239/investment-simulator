from app import db
from app.models import *

db.create_all()
Stock.initialise()
