from flask import Flask, render_template, request, session
import os
import sys
from requests import get
# from db import db

app = Flask(__name__, static_folder = "static", static_url_path = "/")
app.debug = True

app.secret_key = os.urandom(16)

@app.route('/', methods=['POST', 'GET'])
def index():
    return "Hello World"
    if request.method == 'POST':
        if request.form['login'] == 'login':
            session['username'] = request.form['username']
    return render_template('index.html')

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/register')
def register():
    return render_template('register.html')

@app.route('/play')
def play():
    scripts = ['mousehandler', 'buttons', 'constants', 'polygon', 'path', 'map', 'enemies', 'enemywaves', 'effects', 'pulse', 'projectile', 'towers', 'mapscreen', 'panel', 'canvas']
    scripts = [os.path.join('scripts/', filename + ".js") for filename in scripts]
    return render_template('play.html', scripts=scripts)

if __name__ == "__main__":
    app.run()