from flask_sqlalchemy import SQLAlchemy
from config import Config

db = SQLAlchemy()


class Users(db.Model):
    __tablename__ = 'users'  # Specify the existing table name
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    age = db.Column(db.Integer, nullable=False)


def init_db(app):
    app.config["SQLALCHEMY_DATABASE_URI"] = f"mysql://{Config.MYSQL_USER}:{Config.MYSQL_PASSWORD}@{Config.MYSQL_HOST}/{Config.MYSQL_DB}"
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {'pool_recycle': 280}
    db.init_app(app)
