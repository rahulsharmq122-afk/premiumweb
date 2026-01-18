from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

DB_FILE = 'database.json'

def load_db():
    if not os.path.exists(DB_FILE):
        default_db = {
            "products": [
                {"id": 1, "title": "Premium Netflix 4K", "price": "$12.99", "image": "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=400&q=80"},
                {"id": 2, "title": "Spotify Premium 1yr", "price": "$24.99", "image": "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=400&q=80"},
                {"id": 3, "title": "Canva Pro Lifetime", "price": "$5.00", "image": "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&q=80"},
                {"id": 4, "title": "YouTube Premium", "price": "$3.50", "image": "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&q=80"}
            ],
            "settings": {
                "whatsapp": "1234567890"
            }
        }
        save_db(default_db)
        return default_db
    with open(DB_FILE, 'r') as f:
        return json.load(f)

def save_db(data):
    with open(DB_FILE, 'w') as f:
        json.dump(data, f, indent=4)

@app.route('/api/products', methods=['GET'])
def get_products():
    db = load_db()
    return jsonify(db['products'])

@app.route('/api/products', methods=['POST'])
def add_product():
    db = load_db()
    new_product = request.json
    new_product['id'] = max([p['id'] for p in db['products']] + [0]) + 1
    db['products'].append(new_product)
    save_db(db)
    return jsonify(new_product), 201

@app.route('/api/products/<int:prod_id>', methods=['DELETE'])
def delete_product(prod_id):
    db = load_db()
    db['products'] = [p for p in db['products'] if p['id'] != prod_id]
    save_db(db)
    return jsonify({"status": "deleted"}), 200

@app.route('/api/settings', methods=['GET'])
def get_settings():
    db = load_db()
    return jsonify(db['settings'])

@app.route('/api/settings', methods=['POST'])
def update_settings():
    db = load_db()
    db['settings'].update(request.json)
    save_db(db)
    return jsonify(db['settings'])

if __name__ == '__main__':
    app.run(port=5000, debug=True)
