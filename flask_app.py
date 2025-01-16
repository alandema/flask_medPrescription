from flask import Flask, render_template, jsonify, request
from models import db, Message
from utils.llm_helper import get_llm_response
import config

app = Flask(__name__)
app.config.from_object(config.Config)
db.init_app(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json.get('message')
    
    # Get LLM response
    llm_response = get_llm_response(user_message)
    
    # Store in database
    new_message = Message(
        user_message=user_message,
        llm_response=llm_response
    )
    db.session.add(new_message)
    db.session.commit()
    
    return jsonify({'response': llm_response})

if __name__ == '__main__':
    app.run(debug=True)