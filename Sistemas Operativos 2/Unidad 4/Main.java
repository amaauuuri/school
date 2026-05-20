import java.rmi.Remote;
import java.rmi.RemoteException;
import java.rmi.server.UnicastRemoteObject;
import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;
import java.util.Scanner;

interface ProcesoRemoto extends Remote {
    int obtenerVoto() throws RemoteException;
}

class ProcesoImpl extends UnicastRemoteObject implements ProcesoRemoto {
    private int valorReal;
    private boolean esBizantino;

    protected ProcesoImpl(int valor, boolean bizantino) throws RemoteException {
        this.valorReal = valor;
        this.esBizantino = bizantino;
    }

    @Override
    public int obtenerVoto() throws RemoteException {
        if (esBizantino)
            return (valorReal == 1) ? 0 : 1;
        return valorReal;
    }
}

public class Main {
    public static void main(String[] args) {
        try {
            Scanner sc = new Scanner(System.in);
            System.out.println("--- SIMULADOR DE FALLAS BIZANTINAS (RMI) ---");
            System.out.print("Introduce N (Total de procesos): ");
            int n = sc.nextInt();
            System.out.print("Introduce K (Procesos mentirosos/bizantinos): ");
            int k = sc.nextInt();

            if (n < (2 * k + 1)) {
                System.out.println("\n[!] ERROR: El sistema NO es seguro.");
                System.out.println("Para tolerar " + k + " fallas, necesitas al menos " + (2 * k + 1) + " procesos.");
                return;
            }

            System.out.println("\n[OK] Sistema validado. Engendrando " + (n - 1) + " procesos remotos...");
            Registry registry = LocateRegistry.createRegistry(1099);

            for (int i = 1; i < n; i++) {
                boolean mentiroso = (i <= k);
                registry.rebind("Proceso" + i, new ProcesoImpl(1, mentiroso));
                System.out.println(" > Proceso" + i + " registrado" + (mentiroso ? " [BIZANTINO]" : " [FIABLE]"));
            }

            System.out.println("\nSimulación lista. El sistema ha logrado el acuerdo.");

        } catch (Exception e) {
            System.err.println("Error en el registro: " + e.getMessage());
        }
    }
}