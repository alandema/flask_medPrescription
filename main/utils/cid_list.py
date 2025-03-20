<<<<<<< HEAD
from ..database import Cids


def get_cids():
    cids = Cids.query.order_by(Cids.code.asc()).all()
    return cids
=======
from ..database import Cids


def get_cids():
    medications = Cids.query.all()
    return medications
>>>>>>> 320ef37 (commit)
