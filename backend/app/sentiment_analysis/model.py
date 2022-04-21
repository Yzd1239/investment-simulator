import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
from keras.models import load_model
from keras.preprocessing import sequence
import nltk
import pickle
import numpy as np


try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

model_file = os.path.join(os.path.dirname(__file__), 'model')
model = load_model(model_file)

word_freqs_file = os.path.join(os.path.dirname(__file__), 'word_freqs.pickle')
word_freqs = pickle.load(open(word_freqs_file, 'rb'))

word2index = {word[0]: i + 2 for i, word in
              enumerate(word_freqs.most_common(2000))}
word2index["PAD"] = 0
word2index["UNK"] = 1


def get_news_sentiment(headlines):
    """Takes in a list of news headlines and returns the calculated sentiment"""
    X = np.empty(len(headlines), dtype=list)
    for i, headline in enumerate(headlines):
        words = nltk.word_tokenize(headline.lower())
        seq = []
        for word in words:
            if word in word2index:
                seq.append(word2index[word])
            else:
                seq.append(word2index['UNK'])
        X[i] = seq

    X = sequence.pad_sequences(X, maxlen=40)
    labels = [x[0] for x in model.predict(X)]
    positive_percent = np.mean(labels).item()
    return {'bullishPercent': positive_percent, 'bearishPercent': 1 - positive_percent}
