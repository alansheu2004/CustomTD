from flask_frozen import Freezer
from app import app
import sys, os

freezer = Freezer(app)

app.config['FREEZER_RELATIVE_URLS'] = True

if __name__ == '__main__':
    freezer.freeze()
    if (len(sys.argv) > 1 and sys.argv[1]=="serve"):
        freezer.run()
    