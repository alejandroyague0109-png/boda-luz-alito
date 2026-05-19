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

# RUTA DEL PANEL DE CONTROL (ADMINISTRACIÓN)
@app.route('/info')
def panel_control():
    if not supabase:
        return "Base de datos no configurada", 500
    try:
        # 1. Obtener todas las respuestas del RSVP
        rsvp_response = supabase.table('rsvp_responses').select('*').execute()
        rsvps = rsvp_response.data
        
        # 2. Obtener todas las reservas de regalos
        gifts_response = supabase.table('gift_reservations').select('*').execute()
        gifts = gifts_response.data
        
        # Diccionario para traducir los gift_id de la DB a nombres bonitos en la tabla
        gift_map = {
            "noche_bodas": "Noche de bodas - Suter Petit Hotel",
            "flores_ceremonia": "Flores iglesia y demás",
            "torta_casamiento": "Torta de Casamiento",
            "show_vivo": "Show en vivo",
            "decoradora": "Decoradora",
            "viaticos_fotografos": "Alojamiento y viáticos fotógrafos",
            "peluqueria_maquillaje": "Peluquería + maquillaje",
            "artista_especial": "Artista especial",
            "registro_civil": "Registro civil",
            "coro_iglesia": "Coro iglesia",
            "pasajes_avion": "Pasajes de Avión",
            "noches_alojamiento": "Noches de alojamiento",
            "excursion_piramides": "Excursión a las pirámides",
            "heladera": "Heladera",
            "lavarropas": "Lavarropas",
            "microondas": "Microondas",
            "horno_electrico": "Horno eléctrico",
            "lavavajillas": "Lavavajillas",
            "licuadora": "Licuadora",
            "procesadora": "Procesadora/cortadora de verdura",
            "batidora_minipimer": "Batidora + minipimer",
            "extractor_campana": "Extractor y campana",
            "maquina_coser": "Máquina de coser",
            "pastalinda": "Pastalinda",
            "freezer_cajon": "Freezer cajón",
            "plancha_ropa": "Plancha de ropa + planchador",
            "cuidado_pelo": "Plancha de pelo + secador",
            "impresora": "Impresora color",
            "aire_acondicionado": "Aire acondicionado frio/calor",
            "calefactor": "Calefactor",
            "colchon_sommier": "Colchón y sommier King",
            "almohadas_sabanas": "Juego de almohadas inteligentes + sábanas",
            "juego_sabanas_x4": "Juego de sábanas x4 King",
            "acolchado_king": "Acolchado King",
            "mesa_sillas": "Mesa + sillas",
            "espejo_entero": "Espejo de cuerpo entero",
            "crucifijo": "Crucifijo grande",
            "sagrada_familia": "Imagen Sagrada Familia (estatua)",
            "organizadores_placard": "Organizadores de Placard",
            "silla_gamer": "Silla gamer",
            "brasero": "Brasero",
            "kit_utensilios": "Kit de utensilios de cocina",
            "fuentes_horno": "Set de fuentes para horno (Pyrex)",
            "tachos_basura": "Tacho de basura de acero x3",
            "suscripciones_plataformas": "1 año de suscripción a plataformas",
            "combo_todos_dias": "Combo de todos los días",
            "combo_desayuno": "Combo desayuno argentino",
            "combo_cine": "Combo cine en casa"
        }
        
        # Asignamos el nombre traducido a cada regalo
        for gift in gifts:
            gift['gift_name'] = gift_map.get(gift['gift_id'], gift['gift_id'])
            
        # Calcular estadísticas rápidas para los bloques del panel
        total_familias = len(rsvps)
        total_invitados = sum(int(r.get('number_guests', 0)) for r in rsvps)
        total_regalos = len(gifts)
        
        return render_template('info.html', 
                               rsvps=rsvps, 
                               gifts=gifts, 
                               total_familias=total_familias,
                               total_invitados=total_invitados, 
                               total_regalos=total_regalos)
    except Exception as e:
        print(f"Error en panel de control: {e}")
        return f"Error al cargar los datos: {str(e)}", 500

if __name__ == '__main__':
    app.run(debug=True, port=int(os.environ.get("PORT", 5000)))