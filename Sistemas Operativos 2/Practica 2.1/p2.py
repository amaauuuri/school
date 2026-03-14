import socket

# Configuración de red (Localhost y puerto)
IP = "127.0.0.1"
PORT = 5005

# Crear el socket UDP
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind((IP, PORT))

print(f"P2: Esperando números en {IP}:{PORT}...")

while True:
    # 1. Recibir x
    data_x, addr = sock.recvfrom(1024)
    x = int(data_x.decode())
    
    # 2. Recibir y
    data_y, addr = sock.recvfrom(1024)
    y = int(data_y.decode())
    
    print(f"P2: Recibidos x={x}, y={y}. Calculando suma...")
    
    # 3. Sumar
    suma = x + y
    
    # 4. Enviar resultado de vuelta a P1
    sock.sendto(str(suma).encode(), addr)
    print(f"P2: Resultado {suma} enviado a P1.\n")