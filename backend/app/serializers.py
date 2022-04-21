from flask_restx import fields
from app import api

signup_fields = api.model('Sign up', {
    'first_name': fields.String(description='First name'),
    'last_name': fields.String(description='Last name'),
    'username': fields.String(description='Username'),
    'password': fields.String(description='Password')
})

login_fields = api.model('Login', {
    'username': fields.String(description='Username'),
    'password': fields.String(description='Password')
})

stock_fields = api.model('Stock Symbol', {
    'symbol': fields.String(description='Stock code/ticker')
})

buy_sell_fields = api.model('Buy/Sell', {
    'symbol': fields.String(description='Stock code/ticker'),
    'quantity': fields.Integer(description='Quantity to buy/sell')
})
