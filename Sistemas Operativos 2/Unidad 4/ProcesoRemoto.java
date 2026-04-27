import java.rmi.Remote;
import java.rmi.RemoteException;

public interface ProcesoRemoto extends Remote {
    // El proceso principal usará esto para pedirle su voto a los demás
    int obtenerVoto() throws RemoteException;
}