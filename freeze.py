from flask_frozen import Freezer
from app import app
import sys

freezer = Freezer(app)

app.config['FREEZER_RELATIVE_URLS'] = True
app.config['FREEZER_BASE_URL'] = "TowerDefense/build"

if __name__ == '__main__':
    freezer.freeze()
    if (len(sys.argv) > 1 and sys.argv[1]=="run"):
        freezer.run()
    
