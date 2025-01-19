from flask import current_app, render_template, request, redirect, url_for, flash
from .database import db, Patients, Prescriptions
from datetime import datetime
from .utils.professional_info import get_professional_info


@current_app.route('/')
def index():
    return render_template('index.html')


@current_app.route('/create_prescription', methods=['GET', 'POST'])
def create_prescription():
    if request.method == 'POST':
        try:
            prescription_data = {
                'patient_id': request.form.get('patient'),
                'prescription_type': request.form.get('prescription_type'),
                'created_at': datetime.now(),
                'medications': []
            }

            # Add CID if hormonal
            if prescription_data['prescription_type'] == 'hormonal':
                prescription_data['cid'] = request.form.get('cid')
                if not prescription_data['cid']:
                    flash('CID é obrigatório para prescrições hormonais.', 'error')
                    return redirect(url_for('create_prescription'))

            # Process medications
            medication_selects = request.form.getlist('medication-select[]')
            custom_medications = request.form.getlist('custom-medication[]')
            dosage_selects = request.form.getlist('dosage-select[]')
            custom_dosages = request.form.getlist('custom-dosage[]')
            instructions = request.form.getlist('usage-instructions[]')

            for i in range(len(medication_selects)):
                medication = {
                    'name': custom_medications[i] if medication_selects[i] == 'custom' else medication_selects[i],
                    'dosage': custom_dosages[i] if dosage_selects[i] == 'custom' else dosage_selects[i],
                    'instructions': instructions[i]
                }
                prescription_data['medications'].append(medication)

            # Save prescription to database
            # db.prescriptions.insert(prescription_data)  # Implement according to your database

            flash('Prescrição criada com sucesso!', 'success')
            return redirect(url_for('view_prescription', id=prescription_id))  # Implement view route

        except Exception as e:
            flash(f'Erro ao criar prescrição: {str(e)}', 'error')
            return redirect(url_for('create_prescription'))

    # GET request - render form
    return render_template(
        'create_prescription.html',
        patients=Patients.query.all(),  # Implement this function
        medications=["a", "b", "c"],  # Implement this function
        dosages=["a", "b", "c"],  # Implement this function
        cid_list=["a", "b", "c"],  # Implement this function
        doctor=get_professional_info(),  # Implement this function
    )


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
        query = Prescriptions.query
        if patient_id:
            query = query.filter_by(patient_id=patient_id)

        if date_from:
            query = query.filter(Prescriptions.date_prescribed >= date_from)

        if date_to:
            query = query.filter(Prescriptions.date_prescribed <= date_to)

        prescriptions = query.all()

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
