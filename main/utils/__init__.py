from ..database import Prescriptions


def get_filtered_prescriptions(patient_id, date_from, date_to):
    query = Prescriptions.query

    if patient_id:
        query = query.filter_by(patient_id=patient_id)

    if date_from:
        query = query.filter(Prescriptions.date_prescribed >= date_from)

    if date_to:
        query = query.filter(Prescriptions.date_prescribed <= date_to)

    prescriptions = query.all()
    return prescriptions
