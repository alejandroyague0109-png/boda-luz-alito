# app.py
import os
from flask import Flask, render_template, request, jsonify
from supabase import create_client, Client
from dotenv import load_dotenv

if os.path.exists(".env"):
    load_dotenv()

app = Flask(__name__)

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if SUPABASE_URL and SUPABASE_KEY:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    print("WARNING: Credenciales de Supabase no encontradas.")
    supabase = None

# RUTA PARA LA VERSIÓN EN ESPAÑOL (La que ya tienes)
@app.route('/')
def index():
    return render_template('index.html')

# NUEVA RUTA PARA LA VERSIÓN EN ALEMÁN
@app.route('/de')
def index_de():
    return render_template('index_de.html')

# RUTA PARA LA VERSIÓN CON PAGO DE TARJETA
@app.route('/tarjeta')
def index_tarjeta():
    return render_template('index_tarjeta.html')

# RUTA PARA LA VERSIÓN CON PAGO DE TARJETA
@app.route('/brindis')
def index_tarjeta():
    return render_template('index_brindis.html')

@app.route('/api/rsvp', methods=['POST'])
def rsvp():
    if not supabase:
        return jsonify({"success": False, "error": "Base de datos no configurada"}), 500
        
    try:
        data = request.json
        
        if not data.get('nombre') or not data.get('personas'):
             return jsonify({"success": False, "error": "Faltan datos obligatorios"}), 400
             
        insert_data = {
            "name_representative": data.get('nombre'),
            "number_guests": int(data.get('personas')),
            "other_names": data.get('nombres_invitados', ''),
            "menu_type": data.get('menu', 'estandar'),
            "dietary_restrictions": data.get('menu_detalles', ''),
            "must_play_song": data.get('cancion', '')
        }
        
        supabase.table('rsvp_responses').insert(insert_data).execute()
        return jsonify({"success": True})
        
    except Exception as e:
        print(f"Error guardando RSVP: {e}")
        return jsonify({"success": False, "error": "Error del servidor"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=int(os.environ.get("PORT", 5000)))