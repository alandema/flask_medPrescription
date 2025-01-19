from flask_sqlalchemy import SQLAlchemy
from config import Config
from datetime import datetime

db = SQLAlchemy()


class Patient(db.Model):
    __tablename__ = 'patients'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    date_of_birth = db.Column(db.Date, nullable=False)
    prescriptions = db.relationship('Prescription', backref='patient', lazy=True)


class Prescription(db.Model):
    __tablename__ = 'prescriptions'
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    medication = db.Column(db.String(100), nullable=False)
    dosage = db.Column(db.String(50), nullable=False)
    date_prescribed = db.Column(db.DateTime, default=datetime.utcnow)


def init_db(app):
    app.config["SQLALCHEMY_DATABASE_URI"] = f"mysql+mysqldb://{Config.MYSQL_USER}:{Config.MYSQL_PASSWORD}@{Config.MYSQL_HOST}/{Config.MYSQL_DB}"
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {'pool_recycle': 280}
    db.init_app(app)
