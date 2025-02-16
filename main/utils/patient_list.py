from ..database import Patients


def get_patients():
    patients = Patients.query.order_by(Patients.name.asc()).all()
    return patients
