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
def index_brindis():
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

# RUTA PARA LA LISTA DE REGALOS (DISEÑO CANVA NATIVO)
@app.route('/regalos')
def lista_regalos():
    return render_template('lista_regalos.html')

@app.route('/api/regalos/estado', methods=['GET'])
def obtener_estado_regalos():
    if not supabase:
        return jsonify([]), 500
    try:
        # Traemos todas las reservas actuales
        response = supabase.table('gift_reservations').select('gift_id', 'reserved_by').execute()
        return jsonify({"success": True, "reservas": response.data})
    except Exception as e:
        print(f"Error obteniendo estado de regalos: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/regalos/reservar', methods=['POST'])
def reservar_regalo():
    if not supabase:
        return jsonify({"success": False, "error": "DB no configurada"}), 500
    try:
        data = request.json
        gift_id = data.get('gift_id')
        reserved_by = data.get('reserved_by')

        if not gift_id or not reserved_by:
            return jsonify({"success": False, "error": "Datos incompletos"}), 400

        insert_data = {
            "gift_id": gift_id,
            "reserved_by": reserved_by
        }
        
        supabase.table('gift_reservations').insert(insert_data).execute()
        return jsonify({"success": True})
    except Exception as e:
        print(f"Error reservando regalo: {e}")
        return jsonify({"success": False, "error": "Este regalo ya podría estar reservado"}), 500

@app.route('/api/regalos/cancelar', methods=['POST'])
def cancelar_regalo():
    if not supabase:
        return jsonify({"success": False, "error": "DB no configurada"}), 500
    try:
        data = request.json
        gift_id = data.get('gift_id')

        if not gift_id:
            return jsonify({"success": False, "error": "Falta el ID del regalo"}), 400

        supabase.table('gift_reservations').delete().eq('gift_id', gift_id).execute()
        return jsonify({"success": True})
    except Exception as e:
        print(f"Error cancelando reserva: {e}")
        return jsonify({"success": False, "error": str(e)}), 500