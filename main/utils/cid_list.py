from ..database import Cids


def get_cids():
    medications = Cids.query.all()
    return medications
