from flask import render_template, current_app, request, redirect, url_for
from .database import db, Patients, Prescriptions
from datetime import datetime
from .utils import get_filtered_prescriptions


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
        name = request.form.get('name')
        cpf = request.form.get('cpf')
        birth_date = request.form.get('birth_date')
        phone = request.form.get('phone')
        street = request.form.get('street')
        number = request.form.get('number')
        additional_info = request.form.get('additional_info', "")
        country = request.form.get('country')
        state = request.form.get('state', "")
        city = request.form.get('city', "")
        medical_history = request.form.get('medical_history', "")

        birth_date = datetime.strptime(birth_date, '%Y-%m-%d').date()

        if request.form.get('patient_id'):
            patient = Patients.query.get(request.form.get('patient_id'))
            patient.name = name
            patient.cpf = cpf
            patient.birth_date = birth_date
            patient.phone = phone
            patient.street = street
            patient.number = number
            patient.additional_info = additional_info
            patient.country = country
            patient.state = state
            patient.city = city
            patient.medical_history = medical_history
        else:
            patient = Patients(
                name=name,
                cpf=cpf,
                birth_date=birth_date,
                phone=phone,
                street=street,
                number=number,
                additional_info=additional_info,
                country=country,
                state=state,
                city=city,
                medical_history=medical_history
            )
            db.session.add(patient)

        db.session.commit()
        return redirect(url_for('index'))
    return render_template('register_patient.html')


@current_app.route('/prescriptions_history', methods=['GET', 'POST'])
def prescriptions_history():
    # Query all patients for the dropdown
    patients = Patients.query.all()  # Or however you fetch your patients

    if request.method == 'POST':
        # Get filter parameters
        patient_id = request.form.get('patient')
        date_from = request.form.get('date_from')
        date_to = request.form.get('date_to')

        # Query prescriptions based on filters
        prescriptions = get_filtered_prescriptions(patient_id, date_from, date_to)

        return render_template('prescriptions_history.html',
                               patients=patients,
                               prescriptions=prescriptions)

    # If it's a GET request, only show the form
    return render_template('prescriptions_history.html',
                           patients=patients)


@current_app.route('/view_prescription/<int:id>', methods=['GET'])
def view_prescription(id):
    # Your view logic here
    pass


@current_app.route('/print_prescription/<int:id>', methods=['GET'])
def print_prescription(id):
    # Your view logic here
    pass
