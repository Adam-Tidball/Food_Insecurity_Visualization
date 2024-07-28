from flask import Flask, render_template, send_from_directory, request, jsonify
from flask_assets import Environment, Bundle
import mimetypes
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/css', '.css')
  
# creates a Flask application 
app = Flask(__name__, instance_relative_config=False) 
# TODO: Bundle later, makes devving annoying
# assets = Environment(app)
# Environment.cache=False
# Environment.manifest=False
# js = Bundle('src/js/*.js', output='dist/js/bundle.js')
# assets.register("js_all", js)
# js.build()


@app.route("/data/<path:filename>")
def serve_static(filename):
    return send_from_directory('data', filename)

@app.route("/") 
def index(): 
    return render_template('/index.html')

@app.route("/filter_data", methods=["POST"])
def filter_data():
    data = request.json
    selected_provinces = data['provinces']
    selected_characteristics = data['characteristics']
    
    print(selected_provinces)
    print(selected_characteristics)
    
    return jsonify(data)



# run the application 
if __name__ == "__main__": 
    app.run(debug=True)
