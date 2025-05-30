from dotenv import load_dotenv  # noqa
load_dotenv('config.env')  # noqa

from main.config import Config
from flask import Flask
from main.database import db
from sqlalchemy_utils import database_exists, create_database

import os


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    if app.config['FLASK_ENV'] == 'development':
        # Use SQLite for local development
        basedir = os.path.abspath(os.path.dirname(__file__))
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'app.db')
        app.config['SECRET_KEY'] = Config.SECRET_KEY
    else:
        # Use MySQL for production (PythonAnywhere)
        app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+mysqldb://{Config.MYSQL_USER}:{Config.MYSQL_PASSWORD}@{Config.MYSQL_HOST}/{Config.MYSQL_DB}"
        app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {'pool_recycle': 280}
        app.config['SECRET_KEY'] = Config.SECRET_KEY

    db.init_app(app)

    with app.app_context():
        if not database_exists(app.config['SQLALCHEMY_DATABASE_URI']):
            create_database(app.config['SQLALCHEMY_DATABASE_URI'])
        db.create_all()
        import main.routes as routes  # Importing routes to register them

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)
