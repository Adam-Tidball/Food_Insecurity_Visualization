from flask import Flask, render_template 
from flask_assets import Environment, Bundle
  
# creates a Flask application 
app = Flask(__name__, instance_relative_config=False) 
assets = Environment(app)
Environment.cache=False
Environment.manifest=False
js = Bundle('src/js/*.js', output='dist/js/bundle.js')
assets.register("js_all", js)
js.build()


@app.route("/") 
def index(): 
    return render_template('/index.html')


# run the application 
if __name__ == "__main__": 
    app.run(debug=True)
