from flask import current_app, render_template, request, redirect, url_for, flash, Response, jsonify
from .database import db, Patients, Prescriptions, Cids, Medications
from datetime import datetime
from .utils.professional_info import get_professional_info
from .utils.medication_list import get_medications
from .utils.cid_list import get_cids
from .utils.patient_list import get_patients
import json
from unidecode import unidecode
from sqlalchemy import func


@current_app.route('/')
def index():
    return render_template('index.html')


@current_app.route('/create_prescription')
def create_prescription():
    return render_template(
        'create_prescription.html',
        patients=get_patients(),
        medications=get_medications(),
        cid_list=get_cids(),
        doctor=get_professional_info()
    )


@current_app.route('/save_prescription', methods=['POST'])
def save_prescription():
    try:
        data = request.json

        # Save to database

        patient_id = data['patientId']
        current_date = data['currentDate']

        json_form_info = {
            'cidId': data.get('cidId', ''),
            'medications': data['medications']
        }

        new_prescription = Prescriptions(
            patient_id=patient_id,
            date_prescribed=datetime.strptime(current_date, '%d/%m/%Y').date(),
            json_form_info=json.dumps(json_form_info)
        )

        db.session.add(new_prescription)
        db.session.commit()

        return jsonify(success=True), 200

    except Exception as e:
        db.session.rollback()
        return jsonify(error=str(e)), 500


@current_app.route('/delete_prescription/<int:id>')
def delete_prescription(id):
    prescription = Prescriptions.query.get_or_404(id)

    try:
        db.session.delete(prescription)
        db.session.commit()
        flash('Prescrição excluída com sucesso', 'success')
    except Exception as e:
        db.session.rollback()
        flash(f'Erro ao excluir prescrição: {str(e)}', 'error')

    return redirect(url_for('prescriptions_history'))


@current_app.route('/register_patient', methods=['GET', 'POST'])
def register_patient():

    if request.method == 'GET':
        # Get all existing patients for the dropdown
        patients = Patients.query.order_by(Patients.name.asc()).all()
        return render_template('register_patient.html', patients=patients)

    elif request.method == 'POST':
        patient_id = request.form.get('patient_id')

        if patient_id:
            patient = Patients.query.get(patient_id)
            cpf = request.form.get('cpf')
            existing_patient = Patients.query.filter(Patients.cpf == cpf, Patients.id != patient.id).first()
            if existing_patient:
                flash('CPF já cadastrado em outro paciente. Por favor, verifique os dados.', 'error')
            else:
                if patient and patient_id != 'new_patient':
                    patient.name = request.form.get('name')
                    patient.gender = request.form.get('gender')
                    patient.cpf = request.form.get('cpf')
                    patient.birth_date = datetime.strptime(request.form.get('birth_date'), '%Y-%m-%d').date()
                    patient.phone = request.form.get('phone')
                    patient.street = request.form.get('street')
                    patient.district = request.form.get('district')
                    patient.house_number = request.form.get('house_number')
                    patient.additional_info = request.form.get('additional_info')
                    patient.country = request.form.get('country')
                    patient.state = request.form.get('state')
                    patient.city = request.form.get('city')
                    patient.medical_history = request.form.get('medical_history')
                    db.session.commit()
                    flash('Paciente atualizado com sucesso!', 'success')
                else:
                    flash('Paciente não encontrado.', 'error')
        else:
            cpf = request.form.get('cpf')
            existing_patient = Patients.query.filter_by(cpf=cpf).first()
            if existing_patient:
                flash('CPF já cadastrado em outro paciente. Por favor, verifique os dados.', 'error')
            else:
                name = request.form.get('name')
                gender = request.form.get('gender')
                cpf = request.form.get('cpf')
                birth_date = datetime.strptime(request.form.get('birth_date'), '%Y-%m-%d').date()
                phone = request.form.get('phone')
                street = request.form.get('street')
                district = request.form.get('district')
                house_number = request.form.get('house_number')
                additional_info = request.form.get('additional_info')
                country = request.form.get('country')
                state = request.form.get('state')
                city = request.form.get('city')
                medical_history = request.form.get('medical_history')
                new_patient = Patients(
                    name=name, cpf=cpf, gender=gender, birth_date=birth_date, phone=phone,
                    street=street, house_number=house_number, district=district, additional_info=additional_info,
                    country=country, state=state, city=city, medical_history=medical_history
                )
                db.session.add(new_patient)
                flash('Paciente cadastrado com sucesso!', 'success')
        try:
            db.session.commit()
            return redirect(url_for('register_patient'))
        except Exception as e:
            db.session.rollback()
            return json.dumps({'error': str(e)}), 400


@current_app.route('/get_patient/<int:patient_id>')
def get_patient(patient_id):
    patient = Patients.query.get(patient_id)
    if patient:
        return json.dumps({
            'id': patient.id,
            'name': patient.name,
            'gender': patient.gender,
            'birth_date': str(patient.birth_date),
            'cpf': patient.cpf,
            'phone': patient.phone,
            'street': patient.street,
            'district': patient.district,
            'house_number': patient.house_number,
            'additional_info': patient.additional_info,
            'country': patient.country,
            'state': patient.state,
            'city': patient.city
        })
    return json.dumps({'error': 'Patient not found'}), 404


@current_app.route('/prescriptions_history', methods=['GET', 'POST'])
def prescriptions_history():
    patients = Patients.query.all()

    # Initialize variables
    selected_patient = None
    date_from = None
    date_to = None

    if request.method == 'POST':
        # Get filter values from form
        patient_id = request.form.get('patient')
        date_from_str = request.form.get('date_from')
        date_to_str = request.form.get('date_to')

        # Build query
        query = Prescriptions.query

        # Filter by patient if selected
        if patient_id:
            query = query.filter(Prescriptions.patient_id == patient_id)
            selected_patient = Patients.query.get(patient_id)

        # Filter by date range
        if date_from_str:
            date_from = datetime.strptime(date_from_str, '%Y-%m-%d')
            query = query.filter(Prescriptions.date_prescribed >= date_from)

        if date_to_str:
            date_to = datetime.strptime(date_to_str, '%Y-%m-%d')
            query = query.filter(Prescriptions.date_prescribed <= date_to)

        prescriptions = query.order_by(Prescriptions.date_prescribed.desc()).all()
    else:
        # On GET request, show all prescriptions
        prescriptions = Prescriptions.query.order_by(Prescriptions.date_prescribed.desc()).limit(10).all()

    return render_template('prescriptions_history.html',
                           prescriptions=prescriptions,
                           patients=patients,
                           selected_patient=selected_patient,
                           date_from=date_from,
                           date_to=date_to)


@current_app.route('/view_prescription/<int:id>')
def view_prescription(id):
    prescription = Prescriptions.query.get_or_404(id)
    patients = Patients.query.all()
    cids = Cids.query.all()
    medications = Medications.query.all()

    # Get prescription details to pre-fill the form
    prescription_data = {
        'id': prescription.id,
        'patient_id': prescription.patient_id,
        'prescription_type': prescription.prescription_type,
        'cid_codes': [cid.id for cid in prescription.cids] if prescription.cids else [],
        'medications': [med.id for med in prescription.medications] if prescription.medications else [],
        'date': prescription.date_prescribed.strftime('%Y-%m-%d')
    }

    return render_template('create_prescription.html',
                           patients=patients,
                           cids=cids,
                           medications=medications,
                           prescription=prescription_data,
                           edit_mode=True)


@current_app.route('/edit_cids', methods=['GET', 'POST'])
def edit_cids():
    if request.method == 'POST':
        cid_id = request.form.get('cid_id')
        code = request.form.get('code')
        description = request.form.get('description')

        if cid_id:
            cid = Cids.query.get(cid_id)
            if cid:
                cid.code = code
                cid.description = description
                flash('CID atualizado com sucesso!', 'success')
                db.session.commit()
        else:
            existent_cid = Cids.query.filter(func.lower(Cids.code) == func.lower(code), Cids.id != cid_id).first()
            if existent_cid:
                flash('Código CID já cadastrado', 'error')
            # Create new CID
            else:
                cid = Cids(code=code, description=description)
                db.session.add(cid)
                flash('CID cadastrado com sucesso!', 'success')
                db.session.commit()

    cid_list = get_cids()
    return render_template('edit_cids.html', cid_list=cid_list)


@current_app.route('/get_cid/<int:cid_id>')
def get_cid(cid_id):
    cid = Cids.query.get(cid_id)
    if cid:
        return json.dumps({
            'id': cid.id,
            'code': cid.code,
            'description': cid.description
        })
    return json.dumps({'error': 'CID not found'}), 404


@current_app.route('/edit_medications', methods=['GET', 'POST'])
def edit_medications():
    if request.method == 'POST':
        medication_id = request.form.get('medication_id')
        name = request.form.get('name')
        information = request.form.get('information')

        if medication_id:
            medication = Medications.query.get(medication_id)
            if medication:
                medication.name = name
                medication.information = information
                flash('Medicamento atualizado com sucesso!', 'success')
                db.session.commit()
        else:

            existent_medication = Medications.query.filter(func.lower(
                Medications.name) == func.lower(name), Medications.id != medication_id).first()
            if existent_medication:
                flash('Medicamento já cadastrado', 'error')
            # Create new CID
            else:
                medication = Medications(name=name, information=information)
                db.session.add(medication)
                flash('Medicamento cadastrado com sucesso!', 'success')
                db.session.commit()

    medications_list = get_medications()
    return render_template('edit_medications.html', medications_list=medications_list)


@current_app.route('/get_medication/<int:medication_id>')
def get_medication(medication_id):
    medication = Medications.query.get(medication_id)
    if medication:
        return json.dumps({
            'id': medication.id,
            'name': medication.name,
            'information': medication.information
        })
    return json.dumps({'error': 'CID not found'}), 404


@current_app.route('/delete_patient/<int:patient_id>', methods=['DELETE'])
def delete_patient(patient_id):
    try:
        # Get the patient from database
        patient = Patients.query.get(patient_id)
        
        if not patient:
            return jsonify({'success': False, 'error': 'Paciente não encontrado'}), 404
        
        # Delete the patient - SQLAlchemy will handle cascade if properly set up in your models
        db.session.delete(patient)
        db.session.commit()
        
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
