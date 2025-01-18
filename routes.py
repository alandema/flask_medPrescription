from flask import render_template, current_app
from flask import render_template
from database import db, User


@current_app.route('/')
def index():
    rows = db.session.query(User).limit(5).all()
    return render_template('index.html', rows=rows)
