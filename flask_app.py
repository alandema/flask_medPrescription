from dotenv import load_dotenv  # noqa
load_dotenv('config.env')  # noqa

from config import Config
from flask import Flask
from database import init_db


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    init_db(app)  # Add this line

    # Import routes from main and chatbot logic
    with app.app_context():
        import routes  # Importing routes to register them

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
