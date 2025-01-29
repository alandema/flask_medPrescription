from flask import current_app, render_template, request, redirect, url_for, flash, Response
from .database import db, Patients, Prescriptions
from datetime import datetime
from .utils.professional_info import get_professional_info
from .utils.medication_list import get_medications
from .utils.cid_list import get_cids
import json
from weasyprint import HTML
import base64


@current_app.route('/')
def index():
    return render_template('index.html')


@current_app.route('/create_prescription')
def create_prescription():
    print(db.session.query(Patients).order_by(Patients.name.asc()).all())
    return render_template(
        'create_prescription.html',
        patients=db.session.query(Patients).order_by(Patients.name.asc()).all(),
        medications=get_medications(),
        cid_list=get_cids(),
        doctor=get_professional_info()
    )


@current_app.route('/save_prescription', methods=['POST'])
def save_prescription():
    try:
        data = request.get_json()

        # Add CSS to HTML
        full_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                {open('static/css/style.css').read()}
            </style>
        </head>
        <body>
            {data['html']}
        </body>
        </html>
        """

        html = HTML(string=full_html)
        pdf_bytes = html.write_pdf()

        new_prescription = Prescriptions(
            patient_id=data['patientId'],
            pdf_content=pdf_bytes,  # Store as blob
            date_prescribed=datetime.strptime(data['currentDate'], '%Y-%m-%d').date()
        )

        db.session.add(new_prescription)
        db.session.commit()

        return json.dumps({
            'success': True,
            'prescription_id': new_prescription.id
        }), 200

    except Exception as e:
        db.session.rollback()
        return json.dumps({'error': str(e)}), 500


@current_app.route('/download_prescription/<int:prescription_id>')
def download_prescription(prescription_id):
    prescription = Prescriptions.query.get_or_404(prescription_id)
    patient = Patients.query.get(prescription.patient_id)

    # Format filename with proper sanitization
    safe_name = patient.name.replace(' ', '_').replace('/', '-')
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
                house_number = request.form.get('house_number')
                additional_info = request.form.get('additional_info')
                country = request.form.get('country')
                state = request.form.get('state')
                city = request.form.get('city')
                medical_history = request.form.get('medical_history')
                new_patient = Patients(
                    name=name, cpf=cpf, gender=gender, birth_date=birth_date, phone=phone,
                    street=street, house_number=house_number, additional_info=additional_info,
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
