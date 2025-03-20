from flask import current_app, render_template, request, redirect, url_for, flash, Response, jsonify
from .database import db, Patients, Prescriptions, Cids, Medications
from datetime import datetime
from .utils.professional_info import get_professional_info
from .utils.medication_list import get_medications
from .utils.cid_list import get_cids
from .utils.patient_list import get_patients
import json
from weasyprint import HTML
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
        data = request.get_json()
        patient_id = data['patientId']
        current_date = data['currentDate']
        print_contents = data['printContents']

        full_html = render_template('pdf/prescription_pdf.html', content=print_contents)

        pdf_bytes = HTML(string=full_html).write_pdf()

        # Save to database
        new_prescription = Prescriptions(
            patient_id=patient_id,
            pdf_content=pdf_bytes,
            date_prescribed=datetime.strptime(current_date, '%Y-%m-%d').date()
        )
        db.session.add(new_prescription)
        db.session.commit()

        return jsonify(success=True, prescription_id=new_prescription.id)

    except Exception as e:
        db.session.rollback()
        return jsonify(error=str(e)), 500


@current_app.route('/download_prescription/<int:prescription_id>')
def download_prescription(prescription_id):
    prescription = Prescriptions.query.get_or_404(prescription_id)
    patient = Patients.query.get(prescription.patient_id)

    # Format filename with proper sanitization
    safe_name = unidecode(patient.name.replace(' ', '_').replace('/', '-'))
    date_str = prescription.date_prescribed.strftime('%Y-%m-%d')
    filename = f"{safe_name}_{date_str}.pdf"

    return Response(
        prescription.pdf_content,
        mimetype='application/pdf',
        headers={
            'Content-Disposition': f'attachment; filename="{filename}"'
        }
    )


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


@current_app.route('/delete_item')
def delete_item(object):
    object = request.get_json()
    object = json.loads(object) if isinstance(object, str) else object
