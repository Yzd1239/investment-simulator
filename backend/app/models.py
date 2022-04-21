import time
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from sqlalchemy.orm.collections import attribute_mapped_collection
from app import app, db
import app.stock_api as stock_api
from app.sentiment_analysis import get_news_sentiment


watchlist_stock = db.Table('watchlist_stock',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('stock_id', db.Integer, db.ForeignKey('stock.id'), primary_key=True)
)


class PortfolioStock(db.Model):
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    stock_id = db.Column(db.Integer, db.ForeignKey('stock.id'), primary_key=True)
    total_units = db.Column(db.Integer)
    total_paid = db.Column(db.Float)
    stock = db.relationship('Stock')

    @property
    def symbol(self):
        return self.stock.symbol

    @property
    def average_price(self):
        return self.total_paid / self.total_units

    def __repr__(self):
        return f'<PortfolioStock {self.user.username} {self.symbol}>'

    def portfolio_data(self):
        current_price = self.stock.current_price
        total_current_worth = self.total_units * current_price
        return {
            'symbol': self.symbol,
            'name': self.stock.name,
            'total_units': self.total_units,
            'total_paid': self.total_paid,
            'average_price': self.average_price,
            'current_price': current_price,
            'total_current_worth': total_current_worth,
            'total_pnl': total_current_worth - self.total_paid
        }


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.Text)
    last_name = db.Column(db.Text)
    username = db.Column(db.Text, index=True, unique=True, nullable=False)
    password_hash = db.Column(db.Text)
    watchlist = db.relationship('Stock', secondary=watchlist_stock, backref='users')
    portfolio = db.relationship('PortfolioStock',
        collection_class=attribute_mapped_collection('symbol'), backref='user')
    realised_pnl = db.Column(db.Float, default=0)
    
    def __repr__(self):
        return f'<User {self.username}>'

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def generate_token(self):
        return jwt.encode({'id': self.id, 'exp': time.time() + 60*60*24},
                          app.config['SECRET_KEY'], algorithm='HS256')

    @staticmethod
    def verify_token(token):
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'],
                              algorithms=['HS256'])
        except:
            return None
        return User.query.get(data['id'])


class Stock(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    symbol = db.Column(db.Text, index=True, unique=True, nullable=False)
    name = db.Column(db.Text)

    @property
    def current_price(self):
        return stock_api.get_price(self.symbol)['current_price']

    def __repr__(self):
        return f'<Stock {self.symbol}>'

    @staticmethod
    def initialise():
        if (not Stock.query.first()):
            db.session.bulk_insert_mappings(Stock, stock_api.get_all_tickers())
            db.session.commit()

    def current_data(self):
        return {'symbol': self.symbol,
                'name': self.name,
                **stock_api.get_price(self.symbol)}

    def historical_data(self):
        return stock_api.get_historical_data(self.symbol)

    def news(self):
        return stock_api.get_news(self.symbol, self.name)

    def news_sentiment(self):
        return get_news_sentiment([article['title'] for article in self.news()])
