import requests
from random import choice


URL = "https://raw.githubusercontent.com/dolph/dictionary/master/popular.txt"

class Dictionary:
    def __init__(self):
        self.previous_words = []
    
    def load_words(self):
        words = requests.get(URL)
        words = words.split("\n")
        self.vocab = words
        
    def get_word(self, word_length: int=5):
        words = [item for item in self.vocab if len(item) == word_length]
        random_word = choice(words)
        self.previous_words.append(random_word)
        return random_word