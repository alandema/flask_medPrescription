from flask import render_template, current_app, request, redirect, url_for
from .database import db, Patient, Prescription


@current_app.route('/')
def index():
    return render_template('index.html')


@current_app.route('/create_prescription', methods=['GET', 'POST'])
def create_prescription():
    if request.method == 'POST':
        # Handle prescription creation
        pass
    return render_template('create_prescription.html')


@current_app.route('/register_patient', methods=['GET', 'POST'])
def register_patient():
    if request.method == 'POST':
        # Handle patient registration
        pass
    return render_template('register_patient.html')


@current_app.route('/prescriptions_history')
def prescriptions_history():
    prescriptions = Prescription.query.order_by(Prescription.date_prescribed.desc()).all()
    return render_template('prescriptions_history.html', prescriptions=prescriptions)
