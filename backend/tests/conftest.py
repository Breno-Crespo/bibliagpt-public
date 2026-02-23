import os
import sys

# Garante que as importações absolutas do backend funcionem corretamente nos testes
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
