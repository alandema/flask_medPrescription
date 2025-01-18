from flask import Flask, render_template, request, current_app, redirect, url_for, session
from flask_login import login_required, login_user, logout_user, current_user
from werkzeug.security import check_password_hash, generate_password_hash
import uuid


@current_app.route('/')
def index():
    return render_template('index.html')
