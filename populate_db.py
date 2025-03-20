import random
from datetime import datetime, timedelta
from flask_app import create_app  # Import the create_app function to initialize the app
from main.database import db, Patients, Medications, Cids  # Import db and models from database.py


def random_date(start, end):
    """Generate a random datetime between two datetime objects."""
    return start + timedelta(seconds=random.randint(0, int((end - start).total_seconds())))


def populate_database():
    # Sample data
    patient_names = ["Alice Smith", "Bob Johnson", "Catherine Lee", "David Brown", "Emma Wilson",
                     "Frank Harris", "Grace Young", "Henry Clark", "Ivy Hall", "Jack Adams"]
    medications = [
        {"name": "Ibuprofen", "information": "Ibuprofen 200mg\nTake 2 tablets every 12 hours"},
        {"name": "Amoxicillin", "information": "Amoxicillin 500mg, excipients\nTake 1 tablet every 8 hours"},
        {"name": "Paracetamol", "information": "Paracetamol 500mg, excipients\nTake 1 tablet every 4-6 hours"},
        {"name": "Metformin", "information": "Metformin 500mg, excipients\nTake 1 tablet every 12 hours"},
        {"name": "Omeprazole", "information": "Omeprazole 20mg, excipients\nTake 1 tablet every 24 hours"}
    ]

    # Generate and insert medications
    for med in medications:
        db_medicament = Medications(
            name=med["name"],
            information=med["information"]
        )
        db.session.add(db_medicament)
        db.session.commit()

    # Generate and insert patients
    for i, name in enumerate(patient_names, start=1):
        patient = Patients(
            name=name,
            cpf=f"{random.randint(10000000000, 99999999999)}",
            gender=random.choice(["Masculino", "Feminino"]),
            birth_date=random_date(datetime(1970, 1, 1), datetime(2010, 12, 12)).date(),
            phone=f"({random.randint(10, 99):02d}) {random.randint(10000, 99999):05d}-{random.randint(1000, 9999):04d}",
            street=f"Street {i}",
            house_number=f"{random.randint(1, 999)}",
            district="District",
            additional_info=f"Apt {random.randint(1, 50)}" if random.random() > 0.5 else None,
            country=random.choice(["BR", "OUTRO"]),
            state=f"State {random.choice(['A', 'B', 'C'])}",
            city=f"City {random.randint(1, 5)}",
            medical_history="No significant history." if random.random() > 0.3 else "Has allergies."
        )
        db.session.add(patient)
        db.session.commit()

    icd_codes = [
        ("E29.1", "Hipofunção testicular"),
        ("E29.8", "Outra disfunção testicular"),
        ("E29.9", "Disfunção testicular não especificada"),
        ("R86.1", "Achados anormais de material proveniente dos órgãos genitais masculinos - nível hormonal anormal"),
        ("E28", "Disfunção ovariana"),
        ("E28.2", "Síndrome do ovário policístico"),
        ("E28.8", "Outra disfunção ovariana"),
        ("E28.9", "Disfunção ovariana não especificada"),
        ("R87.1", "Achados anormais de material proveniente dos órgãos genitais femininos - nível hormonal anormal"),
        ("N95.1", "Estado da menopausa e do climatério feminino"),
        ("E34.9", "Transtorno endócrino não especificado"),
        ("E55", "Deficiência de vitamina D"),
        ("E55.9", "Deficiência não especificada de vitamina D"),
        ("F41.2", "Transtorno misto ansioso e depressivo"),
        ("R45.4", "Irritabilidade e mau humor"),
        ("E27.1", "Hipofunção Adrenal"),
        ("E03.9", "Hipotireoidismo não especificado")
    ]

    for code, description in icd_codes:
        cid = Cids(
            code=code,
            description=description
        )
        db.session.add(cid)
    db.session.commit()


if __name__ == "__main__":
    # Initialize Flask app and database
    app = create_app()
    with app.app_context():  # Ensure the Flask application context is active
        populate_database()
        print("Database populated successfully.")
