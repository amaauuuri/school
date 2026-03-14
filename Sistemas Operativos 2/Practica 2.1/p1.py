import socket
import random
import time

# Configuración
IP_DESTINO = "127.0.0.1"
PORT_DESTINO = 5005

# Crear socket UDP
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

# 1. Generar números aleatorios (1-100)
x = random.randint(1, 100)
y = random.randint(1, 100)

print(f"P1: Números generados: x={x}, y={y}")

# 2. Enviar a P2
sock.sendto(str(x).encode(), (IP_DESTINO, PORT_DESTINO))
sock.sendto(str(y).encode(), (IP_DESTINO, PORT_DESTINO))
print("P1: Números enviados a P2.")

# 3. Recibir resultado (suma)
data_suma, addr = sock.recvfrom(1024)
suma = data_suma.decode()

# 4. Mostrar resultado
print(f"P1: La suma recibida de P2 es: {suma}")