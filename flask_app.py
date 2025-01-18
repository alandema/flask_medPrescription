from dotenv import load_dotenv  # noqa
load_dotenv('config.env')  # noqa

from config import Config
from flask import Flask


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Import routes from main and chatbot logic
    with app.app_context():
        import routes  # Importing routes to register them

    return app
