from importlib.resources import files

#: used in controller
_pkg_files = files(__name__)

__all__ = ["controller","static"]
