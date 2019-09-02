from flask import Flask, render_template
import os

app = Flask(__name__, static_folder = "static", static_url_path = "")
app.debug = True

@app.route('/')
def index():
    scripts = []
    for filename in os.listdir('static/scripts'):
        if filename.endswith(".js"):
            scripts.append(os.path.join('scripts/', filename))
        else:
            continue
    return render_template('index.html', scripts=scripts)

if __name__ == "__main__":
    app.run()