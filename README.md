# Medical Prescription Management System

A Flask-based web application designed to help healthcare professionals manage medical prescriptions and patient information digitally.

## Features

- **Patient Management**
  - Add and edit patient information
  - Store comprehensive patient details including contact info and medical history
  - Brazilian address integration with automatic CEP (postal code) lookup

- **Prescription Management**
  - Create and edit medical prescriptions
  - Real-time prescription preview
  - Support for both hormonal and non-hormonal prescriptions
  - Print prescriptions in A4 format

- **Medical Records**
  - Track prescription history
  - Filter prescriptions by patient and date range
  - Manage CID (International Classification of Diseases) codes
  - Maintain medication database

## Technology Stack

- **Backend**: Python Flask
- **Database**: MySQL (Production) / SQLite (Development)
- **Frontend**: HTML, CSS, JavaScript
- **Dependencies**: See `requirements.txt`

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd flaskApp_pythonanywhere
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate  # Windows
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables:
```bash
cp config-template.env config.env
```
Edit `config.env` with your database credentials and settings.

5. Configure professional information:
```bash
cp professional_info-template.json professional_info.json
```
Edit `professional_info.json` with your professional details.

6. Initialize the database:
```bash
python populate_db.py all
```

7. Run the application:
```bash
python flask_app.py
```

## Development

- The application uses Flask's development server when `FLASK_ENV=development`
- SQLite is used for local development
- MySQL is used in production (e.g., on PythonAnywhere)

## Deployment

The application is designed to be deployed on PythonAnywhere, but can be adapted for other hosting services.

## Contributing

Feel free to submit issues and enhancement requests!

## License

[Add your chosen license here]

## Author

[Your name]

---
*This project was created to assist healthcare professionals in managing medical prescriptions and patient information digitally.*