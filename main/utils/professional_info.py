import json


class ProfessionalInfo:
    def __init__(self, name, crbm, cro, city, state, country, phone, cpf):
        self.name = name
        self.crbm = crbm
        self.cro = cro
        self.city = city
        self.state = state
        self.country = country
        self.phone = phone
        self.cpf = cpf


def get_professional_info():
    with open('professional_info.json', 'r') as f:
        data = json.load(f)

    return ProfessionalInfo(
        name=data['name'],
        crbm=data['crbm'],
        cro=data['cro'],
        city=data['city'],
        state=data['state'],
        country=data['country'],
        phone=data['phone'],
        cpf=data['cpf']
    )
