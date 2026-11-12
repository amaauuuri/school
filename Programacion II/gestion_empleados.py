from abc import ABC, abstractmethod

# ==========================================
# 1. CLASE ABSTRACTA EMPLEADO
# ==========================================

class Empleado(ABC):

    def __init__(self, nombre, idEmpleado, salarioBase):
        self.nombre = nombre
        self.idEmpleado = idEmpleado
        self.salarioBase = salarioBase

    @abstractmethod
    def calcularSalarioTotal(self):
        pass

    def mostrarInformacion(self):
        print("Nombre:", self.nombre)
        print("ID:", self.idEmpleado)
        print("Salario base: $", format(self.salarioBase, ".2f"))


# ==========================================
# 2. INTERFAZ BONIFICABLE
# ==========================================

class Bonificable(ABC):

    @abstractmethod
    def calcularBonificacion(self):
        pass


# ==========================================
# 3. CLASE ADMINISTRATIVO
# ==========================================

class Administrativo(Empleado):

    def calcularSalarioTotal(self):
        return self.salarioBase


# ==========================================
# 4. CLASE OPERATIVO
# ==========================================

class Operativo(Empleado, Bonificable):

    def calcularBonificacion(self):
        return 1500

    def calcularSalarioTotal(self):
        return self.salarioBase + self.calcularBonificacion()


# ==========================================
# 5. CLASE GERENTE
# ==========================================

class Gerente(Empleado, Bonificable):

    def calcularBonificacion(self):
        return self.salarioBase * 0.20

    def calcularSalarioTotal(self):
        return self.salarioBase + self.calcularBonificacion()


# ==========================================
# 6. SISTEMA DE GESTION DE EMPLEADOS
# ==========================================

class SistemaEmpleados:

    def __init__(self):
        self.empleados = []

    # --------------------------------------
    # VALIDAR NUMEROS
    # --------------------------------------

    def pedirSalario(self):

        while True:

            try:
                salario = float(input("Ingresa el salario base: $"))

                if salario > 0:
                    return salario

                print("El salario debe ser mayor que cero.")

            except ValueError:
                print("Error: Ingresa una cantidad numerica.")

    # --------------------------------------
    # AGREGAR EMPLEADO
    # --------------------------------------

    def agregarEmpleado(self):

        print("\nAGregar empleado")

        print("1. Administrativo")
        print("2. Operativo")
        print("3. Gerente")

        tipo = input("Selecciona el tipo: ")

        if tipo not in ["1", "2", "3"]:
            print("Tipo de empleado incorrecto.")
            return

        nombre = input("Nombre del empleado: ").strip()

        if nombre == "":
            print("El nombre no puede estar vacio.")
            return

        idEmpleado = input("ID del empleado: ").strip()

        if idEmpleado == "":
            print("El ID no puede estar vacio.")
            return

        # Validar ID repetido

        for empleado in self.empleados:

            if empleado.idEmpleado == idEmpleado:

                print("Este ID ya se encuentra registrado.")
                return

        salario = self.pedirSalario()

        # Crear empleado segun su tipo

        if tipo == "1":

            nuevo = Administrativo(
                nombre, idEmpleado, salario
            )

        elif tipo == "2":

            nuevo = Operativo(
                nombre, idEmpleado, salario
            )

        else:

            nuevo = Gerente(
                nombre, idEmpleado, salario
            )

        self.empleados.append(nuevo)

        print("\nEmpleado registrado correctamente.")


    # --------------------------------------
    # MOSTRAR TODOS LOS EMPLEADOS
    # --------------------------------------

    def mostrarEmpleados(self):

        print("\nEstos son los empleados")

        if not self.empleados:

            print("No hay empleados registrados.")
            return

        for empleado in self.empleados:


            empleado.mostrarInformacion()

            print("Tipo:", type(empleado).__name__)

            if isinstance(empleado, Bonificable):

                print("Bonificacion: $",
                      format(empleado.calcularBonificacion(), ".2f"))

            else:

                print("Bonificacion: No recibe")

            print("Salario total: $",
                  format(empleado.calcularSalarioTotal(), ".2f"))




    # --------------------------------------
    # CALCULAR NOMINA GENERAL
    # --------------------------------------

    def calcularNomina(self):

        print("\nPagos a los trabajadores")

        if not self.empleados:

            print("No existen empleados registrados.")
            print("Primero debes agregar empleados.")
            return

        totalSalarios = 0
        totalBonificaciones = 0
        totalBase = 0

        administrativos = 0
        operativos = 0
        gerentes = 0

        for empleado in self.empleados:

            # Sumar salarios base
            totalBase += empleado.salarioBase

            # Calcular bonificaciones
            if isinstance(empleado, Bonificable):

                bono = empleado.calcularBonificacion()

            else:

                bono = 0

            totalBonificaciones += bono

            # Calcular salario total
            salario = empleado.calcularSalarioTotal()

            totalSalarios += salario

            # Contar empleados por tipo
            if isinstance(empleado, Administrativo):

                administrativos += 1

            elif isinstance(empleado, Operativo):

                operativos += 1

            elif isinstance(empleado, Gerente):

                gerentes += 1

        # Mostrar resultados

        print("\n------ RESUMEN DE NOMINA ------")

        print("Total de empleados:", len(self.empleados))

        print("Administrativos:", administrativos)

        print("Operativos:", operativos)

        print("Gerentes:", gerentes)

        print("\n------ TOTALES ------")

        print("Total salarios base: $",
              format(totalBase, ".2f"))

        print("Total bonificaciones: $",
              format(totalBonificaciones, ".2f"))


        print("TOTAL DE NOMINA: $",
              format(totalSalarios, ".2f"))




    # --------------------------------------
    # ELIMINAR EMPLEADO
    # --------------------------------------

    def eliminarEmpleado(self):

        print("\nQUitar empleado")

        idEliminar = input("Ingresa el ID del empleado: ").strip()

        for empleado in self.empleados:

            if empleado.idEmpleado == idEliminar:

                self.empleados.remove(empleado)

                print("Empleado eliminado correctamente.")
                return

        print("No se encontro el empleado.")


    # --------------------------------------
    # MENU PRINCIPAL
    # --------------------------------------

    def menu(self):

        while True:

            print("\n")
            print("       SISTEMA DE GESTION DE EMPLEADOS")

            print("1. Agregar empleado")
            print("2. Mostrar empleados")
            print("3. Calcular nomina")
            print("4. Eliminar empleado")
            print("5. Salir")

            opcion = input("Selecciona una opcion: ")

            if opcion == "1":

                self.agregarEmpleado()

            elif opcion == "2":

                self.mostrarEmpleados()

            elif opcion == "3":

                self.calcularNomina()

            elif opcion == "4":

                self.buscarEmpleado()

            elif opcion == "5":

                self.eliminarEmpleado()

            elif opcion == "6":

                print("\nGracias por utilizar el sistema.")
                print("Programa finalizado.")
                break

            else:

                print("Opcion incorrecta. Intenta nuevamente.")


# ==========================================
# 7. EJECUCION DEL PROGRAMA
# ==========================================

if __name__ == "__main__":

    sistema = SistemaEmpleados()

    sistema.menu()