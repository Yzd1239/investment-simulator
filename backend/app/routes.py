from flask import request, abort
from flask_restx import Resource
from flask_httpauth import HTTPTokenAuth
from finnhub import FinnhubAPIException
from app import app, api, db
from app.models import User, Stock, PortfolioStock
import app.serializers


WATCHLIST_LIMIT = 30
auth = HTTPTokenAuth()

@auth.verify_token
def verify_token(token):
    return User.verify_token(token)


auth_namespace = api.namespace('auth', description='Authentication operations')

@auth_namespace.route('/signup')
class Signup(Resource):

    @api.expect(app.serializers.signup_fields)
    @api.doc(responses={200: 'Success', 400: 'Validation Error'})
    @api.doc(security=[])
    @api.doc(description='''
        Creates a new account.
        Username must be unique and password must not be empty.
    ''')
    def post(self):
        username = request.json.get('username')
        password = request.json.get('password')
        if not username:
            abort(400, 'Missing username')
        if not password:
            abort(400, 'Missing password')
        if User.query.filter_by(username=username).first() is not None:
            abort(400, 'Username already exists')
        user = User(first_name=request.json.get('first_name'),
                    last_name=request.json.get('last_name'),
                    username=username)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        return {'username': username}, 200


@auth_namespace.route('/login')
class Login(Resource):

    @api.expect(app.serializers.login_fields)
    @api.doc(responses={200: 'Success', 401: 'Unauthorized'})
    @api.doc(security=[])
    @api.doc(description='''
        Authenticates a user created through signup.
        Returns an auth token which should be passed in subsequent calls to the API to verify the user.
    ''')
    def post(self):
        username = request.json.get('username')
        password = request.json.get('password')
        user = User.query.filter_by(username=username).first()
        if not user or not user.check_password(password):
            abort(401, 'Invalid username or password')
        return {'token': user.generate_token().decode('ascii')}, 200


watchlist_namespace = api.namespace('watchlist', description='Operations on user watchlists')

@watchlist_namespace.route('')
class Watchlist(Resource):

    @api.doc(responses={200: 'Success', 401: 'Unauthorized', 429: 'Too Many Requests'})
    @auth.login_required
    @api.doc(description='''
        Returns data on all stocks in user's portfolio.
        Auth token must be supplied in header.
    ''')
    def get(self):
        try:
            data = [stock.current_data()
                    for stock in auth.current_user().watchlist]
        except FinnhubAPIException:
            abort(429, 'API limit reached. Please try again later.')
        return data, 200


    @api.expect(app.serializers.stock_fields)
    @api.doc(responses={201: 'Created', 400: 'Validation Error', 404: 'Not Found', 401: 'Unauthorized', 403: 'Forbidden'})
    @auth.login_required
    @api.doc(description=f'''
        Adds a stock to user's watchlist.
        Auth token must be supplied in header.
        Stock must exist in our database and not already be added to watchlist.
        The watchlist can have no more than {WATCHLIST_LIMIT} stocks.
    ''')
    def post(self):
        symbol = request.json.get('symbol')
        stock = Stock.query.filter_by(symbol=symbol).first()
        if not stock:
            abort(404, 'Stock does not exist in our database.')
        if stock in auth.current_user().watchlist:
            abort(400, 'Stock already added to watchlist.')
        if len(auth.current_user().watchlist) >= WATCHLIST_LIMIT:
            abort(403, "Too many stocks in the watchlist.")
        auth.current_user().watchlist.append(stock)
        db.session.commit()
        return {'symbol': symbol}, 201


    @api.expect(app.serializers.stock_fields)
    @api.doc(responses={200: 'Success', 404: 'Not Found', 401: 'Unauthorized'})
    @auth.login_required
    @api.doc(description='''
        Deletes stock from user's watchlist.
        Auth token must be supplied in header.
        Stock must already exist in user's watchlist.
    ''')
    def delete(self):
        symbol = request.json.get('symbol')
        stock = Stock.query.filter_by(symbol=symbol).first()
        try:
            auth.current_user().watchlist.remove(stock)
            db.session.commit()
            return {'symbol': symbol}, 200
        except ValueError:
            abort(404, 'No such stock exists in your watchlist.')
            

portfolio_namespace = api.namespace('portfolio', description='Operations on user portfolios')

@portfolio_namespace.route('')
class Portfolio(Resource):

    @api.doc(responses={200: 'Success', 401: 'Unauthorized', 429: 'Too Many Requests'})
    @auth.login_required
    @api.doc(description='''
        Returns data on all stocks in user's portfolio.
        Auth token must be supplied in header.
    ''')
    def get(self):
        try:
            data = [stock.portfolio_data()
                    for stock in auth.current_user().portfolio.values()]
        except FinnhubAPIException:
            abort(429, 'API limit reached. Please try again later.')
        return data, 200


@portfolio_namespace.route('/buy')
class Buy(Resource):

    @api.expect(app.serializers.buy_sell_fields)
    @api.doc(responses={200: 'Success', 400: 'Validation Error', 404: 'Not Found', 401: 'Unauthorized', 429: 'Too Many Requests'})
    @auth.login_required
    @api.doc(description='''
        Buys stock to user's portfolio.
        Auth token must be supplied in header.
        Stock code must be valid.
        Quantity entered must be positive.
        Returns quantity successfully bought.
    ''')
    def post(self):
        user = auth.current_user()
        symbol = request.json.get('symbol')
        stock = Stock.query.filter_by(symbol=symbol).first()
        if not stock:
            abort(404, 'Stock does not exist in our database.')
        quantity = request.json.get('quantity')
        if quantity <= 0 or not isinstance(quantity, int):
            abort(400, 'Invalid quantity.')
        try:
            amount_paid = stock.current_price * quantity
            portfolio_stock = user.portfolio[symbol]
            portfolio_stock.total_units += quantity
            portfolio_stock.total_paid += amount_paid
        except KeyError:
            user.portfolio[symbol] = PortfolioStock(
                total_units=quantity, total_paid=amount_paid, stock=stock)
        except FinnhubAPIException:
            abort(429, 'API limit reached. Please try again later.')
        db.session.commit()
        return {'symbol': symbol, 'quantity': quantity}, 200


@portfolio_namespace.route('/sell')
class Sell(Resource):

    @api.expect(app.serializers.buy_sell_fields)
    @api.doc(responses={200: 'Success', 400: 'Validation Error', 404: 'Not Found', 401: 'Unauthorized', 429: 'Too Many Requests'})
    @auth.login_required
    @api.doc(description='''
        Sells stock from user's portfolio.
        Auth token must be supplied in header.
        Stock code must exist in user's portfolio.
        Quantity entered must be positive and must be equal to or less than what user already owns.
        Returns quantity successfully sold.
    ''')
    def post(self):
        user = auth.current_user()
        symbol = request.json.get('symbol')
        quantity = request.json.get('quantity')
        if quantity <= 0 or not isinstance(quantity, int):
            abort(400, 'Invalid quantity.')
        try:
            portfolio_stock = user.portfolio[symbol]
            if quantity > portfolio_stock.total_units:
                abort(400, 'You do not own enough units to sell.')
            current_price = portfolio_stock.stock.current_price
            average_price = portfolio_stock.average_price

            portfolio_stock.total_units -= quantity
            portfolio_stock.total_paid -= quantity * average_price
            user.realised_pnl += quantity * (current_price-average_price)
            if portfolio_stock.total_units == 0:
                db.session.delete(portfolio_stock)
        except KeyError:
            abort(404, 'No such stock exists in your portfolio.')
        except FinnhubAPIException:
            abort(429, 'API limit reached. Please try again later.')
        db.session.commit()
        return {'symbol': symbol, 'quantity': quantity}, 200


user_namespace = api.namespace('user', description='Operations on user information')

@user_namespace.route('')
class UserData(Resource):

    @api.doc(responses={200: 'Success', 401: 'Unauthorized'})
    @auth.login_required
    @api.doc(description='''
        Returns user data.
        Auth token must be supplied in header.
    ''')
    def get(self):
        user = auth.current_user()
        fields = ['first_name', 'last_name', 'username', 'realised_pnl']
        return {k: v for k, v in user.__dict__.items() if k in fields}, 200


stock_namespace = api.namespace('stock', description='Operations to get data about stocks')

@stock_namespace.route('')
class Stocks(Resource):

    @api.doc(responses={200: 'Success'})
    @api.doc(security=[])
    @api.doc(description='''
        Returns all stocks in our database.
    ''')
    def get(self):
        data = [{'name': stock.name, 'symbol': stock.symbol}
                for stock in Stock.query.all()]
        return data, 200


@stock_namespace.route('/hist_data/<string:symbol>')
class HistoricalData(Resource):

    @api.doc(responses={200: 'Success', 404: 'Not Found'})
    @api.doc(security=[])
    @api.doc(description='''
        Returns daily high, low, open and close for the past year for given stock.
        Stock code must be valid.
    ''')
    def get(self, symbol):
        stock = Stock.query.filter_by(symbol=symbol).first()
        if not stock:
            abort(404, 'Stock does not exist in our database.')
        return stock.historical_data(), 200


@stock_namespace.route('/news/<string:symbol>')
class News(Resource):

    @api.doc(responses={200: 'Success', 404: 'Not Found'})
    @api.doc(security=[])
    @api.doc(description='''
        Returns metadata from trending news articles about given stock.
        Stock code must be valid.
    ''')
    def get(self, symbol):
        stock = Stock.query.filter_by(symbol=symbol).first()
        if not stock:
            abort(404, 'Stock does not exist in our database.')
        return stock.news(), 200


@stock_namespace.route('/news/sentiment/<string:symbol>')
class NewsSentiment(Resource):

    @api.doc(responses={200: 'Success', 404: 'Not Found'})
    @api.doc(security=[])
    @api.doc(description='''
        Returns percentage of bullishness of news sentiment for given stock.
        Stock code must be valid.
    ''')
    def get(self, symbol):
        stock = Stock.query.filter_by(symbol=symbol).first()
        if not stock:
            abort(404, 'Stock does not exist in our database.')
        return stock.news_sentiment(), 200
