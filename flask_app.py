from flask import Flask, render_template, request, jsonify
from database import get_db_connection
from utils.llm_helper import LLMHandler

app = Flask(__name__)
app.config.from_object('config.Config')
llm = LLMHandler()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    prompt = request.json.get('prompt')
    response = llm.generate_response(prompt)
    
    # Store the interaction in database
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO interactions (prompt, response) VALUES (%s, %s)",
        (prompt, response)
    )
    conn.commit()
    cursor.close()
    conn.close()
    
    return jsonify({'response': response})

if __name__ == '__main__':
    app.run(debug=True)