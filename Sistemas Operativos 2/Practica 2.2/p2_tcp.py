import socket

# Configuración del servidor
IP = "127.0.0.1"
PORT = 6000

# 1. Crear el socket TCP (SOCK_STREAM es para TCP)
server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# 2. Enlazar el socket a la dirección y puerto
server_socket.bind((IP, PORT))

# 3. Escuchar conexiones entrantes
server_socket.listen(1)
print(f"P2 (TCP): Esperando conexión en {IP}:{PORT}...")

# 4. Aceptar la conexión de P1
conn, addr = server_socket.accept()
print(f"P2: Conexión establecida con {addr}")

try:
    # Recibir x e y (TCP recibe flujos de bytes)
    data_x = conn.recv(1024).decode()
    x = int(data_x)
    
    data_y = conn.recv(1024).decode()
    y = int(data_y)
    
    print(f"P2: Recibidos x={x}, y={y}. Calculando producto...")
    
    # Operación: Producto
    producto = x * y
    
    # Enviar resultado de vuelta
    conn.send(str(producto).encode())
    print(f"P2: Producto ({producto}) enviado a P1.")

finally:
    # 5. Cerrar la conexión (Vital en TCP)
    conn.close()
    server_socket.close()
    print("P2: Conexión cerrada.")