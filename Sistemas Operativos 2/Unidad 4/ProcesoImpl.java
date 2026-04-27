import java.rmi.server.UnicastRemoteObject;
import java.rmi.RemoteException;

public class ProcesoImpl extends UnicastRemoteObject implements ProcesoRemoto {
    private int valorReal;
    private boolean esBizantino;

    protected ProcesoImpl(int valor, boolean bizantino) throws RemoteException {
        this.valorReal = valor;
        this.esBizantino = bizantino;
    }

    @Override
    public int obtenerVoto() throws RemoteException {
        if (esBizantino) {
            return (valorReal == 1) ? 0 : 1; // Miente: si es 1, manda 0
        }
        return valorReal; // Dice la verdad
    }
}