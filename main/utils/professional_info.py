import json


class ProfessionalInfo:
    def __init__(self, name, crbm, cro, address, phone, cpf):
        self.name = name
        self.crbm = crbm
        self.cro = cro
        self.address = address
        self.cpf = cpf


def get_professional_info():
    with open('professional_info.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    return ProfessionalInfo(
        name=data['name'],
        crbm=data['crbm'],
        cro=data['cro'],
        address=data['address'],
        phone=data['phone'],
        cpf=data['cpf']
    )
