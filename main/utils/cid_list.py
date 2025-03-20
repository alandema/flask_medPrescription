from ..database import Cids


def get_cids():
    cids = Cids.query.order_by(Cids.code.asc()).all()
    return cids
