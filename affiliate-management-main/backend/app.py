from flask import Flask
from flask_cors import CORS
from routes import auth, partners, links, tracking, demo, external

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})  # Enable CORS for all API routes

# Register blueprints
app.register_blueprint(auth.bp)
app.register_blueprint(partners.bp)
app.register_blueprint(links.bp)
app.register_blueprint(tracking.bp)
app.register_blueprint(demo.bp)
app.register_blueprint(external.bp)

@app.route('/api/ping', methods=['GET'])
def ping():
    return {'message': 'pong'}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
