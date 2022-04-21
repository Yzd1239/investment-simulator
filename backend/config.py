import os

class Config:
    SECRET_KEY = os.urandom(24).hex()
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + \
        os.path.join(os.path.dirname(__file__), 'app', 'app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    ERROR_404_HELP = False
    FINNHUB_API_KEY = 'bthsnpf48v6rsb74dk1g'
    NEWS_API_KEY = 'd8dd5ad22e184e97a6a8ba86a7182b0d'
