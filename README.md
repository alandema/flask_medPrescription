# Medical Prescription Management System

A Flask-based web application designed to solve a real-world problem: helping my sister digitally manage medical prescriptions and patient information.

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

## Required Configuration

Before running the application (either directly or with Docker), you must create these configuration files:

1. Configure environment variables:
```bash
cp config-template.env config.env
```
Edit `config.env` with your database credentials and settings.

2. Configure professional information:
```bash
cp professional_info-template.json professional_info.json
```
Edit `professional_info.json` with your professional details.

## Setup Options

### Option 1: Run Directly with Flask

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

4. Initialize the database:
```bash
python populate_db.py all
```

5. Run the application:
```bash
python flask_app.py
```

### Option 2: Run with Docker

1. Clone the repository:
```bash
git clone <repository-url>
cd flask_medPrescription
```

2. **Method A: Using Docker directly**

   Build the Docker image:
   ```bash
   docker build -t med-prescription .
   ```

   Run the container (ensure you've created config.env and professional_info.json first):
   ```bash
   docker run -p 5000:5000 -v $(pwd)/config.env:/app/config.env -v $(pwd)/professional_info.json:/app/professional_info.json med-prescription
   ```
   
   On Windows, use this volume mount syntax:

    CMD:
    ```bash
    docker run -p 5000:5000 -v "%cd%\config.env:/app/config.env" -v "%cd%\professional_info.json:/app/professional_info.json" med-prescription
    ```

    Powershell:
    ```powershell
    docker run -p 5000:5000 -v "${PWD}/config.env:/app/config.env" -v "${PWD}/professional_info.json:/app/professional_info.json" med-prescription
    ```

3. **Method B: Using Docker Compose**

   Run with docker-compose (ensure you've created config.env and professional_info.json first):
   ```bash
   docker-compose up
   ```

   This will mount your entire local directory to the container, which is useful for development.

   Note: When using docker-compose, you may need to initialize the database by running:
   ```bash
   docker-compose exec web python populate_db.py all
   ```

## Development

- The application uses Flask's development server when `FLASK_ENV=development`
- SQLite is used for local development
- MySQL is used in production (e.g., on PythonAnywhere)

## Deployment

The application is designed to be deployed on PythonAnywhere, but can be adapted for other hosting services.

## Author

Alan De Maman

---
*This project was created to assist healthcare professionals in managing medical prescriptions and patient information digitally.*