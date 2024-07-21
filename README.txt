Things I used here: 

Please install pyhton and pip to get started
    `pip install -r requirements.txt` SHOULD cover everything, but if it doesn't, follow the setup below

Manual Setup:
* Flask ( Just a glorified way to serve html most likely, could give us some extra functionality if desperate)
    `pip install flask`
    `pip install flask-assets`
* Tailwind (It makes styling webpages a bit easier to do quickly)
    `pip install pytailwindcss`

* D3
    This is just pulled by the script in /templates/index.html currently

Commands you'll find useful: 

    Tailwind CSS watcher (start this once and then leave it runnig while you dev)
        tailwindcss -i ./static/src/css/input.css -o ./static/dist/css/output.css --watch
    
    Start Flask App 
        python flask_app.py
