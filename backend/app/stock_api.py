import finnhub
import yfinance
import newsapi
import pandas as pd
from app import app, db


finnhub_client = finnhub.Client(api_key=app.config['FINNHUB_API_KEY'])
newsapi_client = newsapi.NewsApiClient(api_key=app.config['NEWS_API_KEY'])


def get_all_tickers():
    """Returns all available S&P500 tickers on Finnhub"""
    tickers = [{'name': ticker['description'], 'symbol': ticker['symbol']}
               for ticker in finnhub_client.stock_symbols('US')]
    sp500 = finnhub_client.indices_const(symbol="^GSPC")['constituents']
    return [ticker for ticker in tickers if ticker['symbol'] in sp500]


def get_price(symbol):
    """Returns a dictionary containing current price data for given stock"""
    quote = finnhub_client.quote(symbol)
    return {
        'current_price': quote['c'],
        'open': quote['o'],
        'high': quote['h'],
        'low': quote['l'],
        'percentage_change': round(100 * ((quote['c']-quote['pc']) / quote['pc']), 2)
    }


def get_historical_data(symbol):
    '''Returns a dictionary containing historical price data for given stock'''
    hist = yfinance.Ticker(symbol).history(period='1y').reset_index()
    hist['Date'] = [pd.to_datetime(date, format='%Y%m%d').strftime('%d-%m-%Y')
                    for date in hist['Date']]
    return hist[['Date', 'Open', 'High', 'Low', 'Close']].to_dict(orient='list')


def get_news(symbol, stock_name):
    '''Returns a list containing metadata for latest news articles about given stock'''
    articles = newsapi_client.get_everything(q=f'{symbol} {stock_name}')
    return [article for article in articles['articles']
            if article['description'] and article['urlToImage']]
