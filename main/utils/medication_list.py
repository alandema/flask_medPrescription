from ..database import Medications

def get_medications():
    medications = Medications.query.all()
    return medications
