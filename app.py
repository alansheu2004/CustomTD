from flask import Flask, render_template, request, session, redirect, url_for
import os
import sys
from requests import get
# from db import db

app = Flask(__name__, static_folder = "static", static_url_path = "/")
app.debug = True

app.secret_key = os.urandom(16)

scripts = ['mousehandler', 'buttons', 'constants', 'polygon', 'path', 'map', 'enemies', 'enemywaves', 'effects', 'pulse', 'projectile', 'towers', 'mapscreen', 'panel', 'canvas']
scripts = [os.path.join('scripts/game/', filename + ".js") for filename in scripts]

@app.route('/', methods=['POST', 'GET'])
def index():
    if request.method == 'POST':
        if request.form['login'] == 'login':
            session['username'] = request.form['username']
    return render_template('index.html')

@app.route('/login')
def login():
    if(session.get('username') is None):
        return render_template('login.html')
    else:
        return redirect(url_for('index'))

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

@app.route('/register')
def register():
    if(session.get('username') is None):
        return render_template('register.html')
    else:
        return redirect(url_for('index'))

@app.route('/editor')
def editor():
    return render_template('editor.html', scripts=scripts)

@app.route('/play')
def play():
    return render_template('play.html', scripts=scripts)

if __name__ == "__main__":
    app.run(debug=True)