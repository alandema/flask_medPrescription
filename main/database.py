from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class Patients(db.Model):
    __tablename__ = 'patients'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    cpf = db.Column(db.String(11), nullable=False)
    date_of_birth = db.Column(db.Date, nullable=False)
    prescriptions = db.relationship('Prescription', backref='patient', lazy=True)


class Prescription(db.Model):
    __tablename__ = 'prescriptions'
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    medication = db.Column(db.String(100), nullable=False)
    dosage = db.Column(db.String(50), nullable=False)
    date_prescribed = db.Column(db.DateTime, default=datetime.now(datetime.timezone.utc))
