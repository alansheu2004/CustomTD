from flask import Flask, render_template, request
import os
import sys
from requests import get

app = Flask(__name__, static_folder = "static", static_url_path = "/")
app.debug = True

@app.route('/')
def index():
    scripts = ['mousehandler', 'buttons', 'constants', 'path', 'map', 'enemies', 'enemywaves', 'projectile', 'towers', 'mapscreen', 'panel', 'canvas']
    scripts = [os.path.join('scripts/', filename + ".js") for filename in scripts]
    return render_template('index.html', scripts=scripts)

if __name__ == "__main__":
    app.run()