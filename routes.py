from flask import render_template, current_app
from database import db, Users


@current_app.route('/')
def index():
    rows = db.session.query(Users).limit(5).all()
    return render_template('index.html', rows=rows)
