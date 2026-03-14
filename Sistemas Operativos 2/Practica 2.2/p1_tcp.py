import socket
import random

# Configuración
IP_DESTINO = "127.0.0.1"
PORT_DESTINO = 6000

# 1. Crear socket TCP
client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# 2. Conectarse al servidor P2
try:
    client_socket.connect((IP_DESTINO, PORT_DESTINO))
    print("P1: Conectado a P2 exitosamente.")

    # Generar números aleatorios
    x = random.randint(1, 100)
    y = random.randint(1, 100)
    print(f"P1: Números generados: x={x}, y={y}")

    # 3. Enviar números (en TCP enviamos uno tras otro)
    client_socket.send(str(x).encode())
    # Pequeña pausa para asegurar que los buffers no se mezclen
    import time
    time.sleep(0.1) 
    client_socket.send(str(y).encode())

    # 4. Recibir el producto
    data_prod = client_socket.recv(1024).decode()
    print(f"P1: El PRODUCTO recibido de P2 es: {data_prod}")

finally:
    # 5. Cerrar socket
    client_socket.close()
    print("P1: Conexión terminada.")