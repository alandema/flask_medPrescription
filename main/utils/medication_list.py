<<<<<<< HEAD
from ..database import Medications


def get_medications():
    medications = Medications.query.order_by(Medications.name.asc()).all()
    return medications
=======
from ..database import Medications

def get_medications():
    medications = Medications.query.all()
    return medications
>>>>>>> 320ef37 (commit)
