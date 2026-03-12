from importlib import import_module

mod = import_module("app")   # imports app.py

if hasattr(mod, "app"):
    app = mod.app
elif hasattr(mod, "application"):
    app = mod.application
elif hasattr(mod, "create_app"):
    app = mod.create_app()
else:
    raise RuntimeError(
        "No Flask app found. Define `app = Flask(__name__)` or `application = Flask(__name__)` "
        "or a `create_app()` function inside app.py"
    )
