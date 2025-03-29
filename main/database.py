from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class Patients(db.Model):
    __tablename__ = 'patients'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    cpf = db.Column(db.String(11), nullable=False)
    birth_date = db.Column(db.Date, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    zipcode = db.Column(db.String(10), nullable=False)
    street = db.Column(db.String(100), nullable=False)
    house_number = db.Column(db.String(10), nullable=False)
    district = db.Column(db.String(20), nullable=True)
    additional_info = db.Column(db.String(20), nullable=True)
    country = db.Column(db.String(20), nullable=False)
    state = db.Column(db.String(20), nullable=True)
    city = db.Column(db.String(20), nullable=True)
    medical_history = db.Column(db.Text, nullable=True)
    prescriptions = db.relationship('Prescriptions', backref='patient', lazy=True, cascade='all, delete-orphan')


class Prescriptions(db.Model):
    __tablename__ = 'prescriptions'
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    date_prescribed = db.Column(db.DateTime, nullable=False, default=datetime.now())
    json_form_info = db.Column(db.Text, nullable=False)


class Medications(db.Model):
    __tablename__ = 'medications'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(20), nullable=False)
    information = db.Column(db.Text, nullable=False)


class Cids(db.Model):
    __tablename__ = 'cids'
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(10), nullable=False)
    description = db.Column(db.Text, nullable=False)
