from flask import Flask
from config import Config


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Import routes from main and chatbot logic
    with app.app_context():
        import routes  # Importing routes to register them

    return app
