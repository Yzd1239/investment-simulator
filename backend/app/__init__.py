from flask import Flask
from flask_restx import Api
from flask_sqlalchemy import SQLAlchemy
from config import Config

app = Flask(__name__)
app.config.from_object(Config)
db = SQLAlchemy(app)

authorizations = {
    'Bearer': {
        'type': 'apiKey',
        'in': 'header',
        'name': 'Authorization',
        'description': "Type in the *'Value'* input box below: **'Bearer &lt;JWT&gt;'**, where &lt;JWT&gt; is the token"
    }
}
api = Api(app=app, version='1.0',
          title='Investment Simulator - H14A Runtime Terror',
          description='The core of the API layer for our solution',
          authorizations=authorizations, security='Bearer')

from app import routes
from app import stock_api