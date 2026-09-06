# ADR 001: Migración a Redis para Escalabilidad Horizontal

## Estado
Propuesto / Planificado (Gatillo: > 10,000 usuarios concurrentes)

## Contexto
Actualmente, nuestro backend en Node.js es *stateful*. Mantenemos todo el estado de las salas, las sesiones de los jugadores y la lógica del `GameEngine` directamente en la memoria RAM del proceso principal de Node.js. 

Esta arquitectura monolítica funciona bien y es extremadamente rápida para nuestra carga actual, lo que nos ahorra valiosos costos de infraestructura. Sin embargo, esta decisión técnica nos impide escalar horizontalmente. Si intentamos levantar múltiples instancias del backend detrás de un balanceador de carga, los usuarios conectados a diferentes nodos no podrán compartir el estado de la sala ni comunicarse adecuadamente (síndrome del estado fragmentado).

## Decisión
Para preparar el sistema para el crecimiento (específicamente cuando superemos la marca de los 10,000 usuarios concurrentes), implementaremos la siguiente arquitectura distribuida:

1. **Adaptador de WebSockets**: Integraremos `@socket.io/redis-adapter` para permitir que el broadcasting de eventos y la gestión de salas (Rooms) de Socket.io funcionen de manera transparente a través de múltiples instancias de Node.js.
2. **Almacenamiento de Estado Centralizado**: Refactorizaremos el `GameEngine` para externalizar el estado de las partidas. El estado se almacenará en Redis utilizando **Redis JSON** (por su eficiencia y soporte nativo para manipulación de documentos JSON).
3. **Manejo de Concurrencia**: Implementaremos mecanismos de *locking* distribuido (ej. Redlock) para evitar condiciones de carrera (Race Conditions) cuando múltiples instancias del servidor intenten modificar el estado de la misma sala de forma simultánea.

## Consecuencias

### Positivas (Por qué vale la pena la inversión)
* **Escalabilidad Horizontal:** Podremos añadir instancias del backend dinámicamente según la carga, evitando cuellos de botella.
* **Tolerancia a Fallos:** Si un nodo de Node.js se reinicia o se cae, el estado de las partidas se mantendrá seguro en Redis y los usuarios podrán reconectarse fluidamente a otro nodo disponible.

### Negativas (Costos y Riesgos)
* **Costos Operativos:** Aumento en los costos por el despliegue y mantenimiento de un clúster de Redis de alta disponibilidad (más Beris requeridos en AWS/GCP).
* **Latencia de I/O:** Ligero incremento en la latencia de las operaciones del juego, ya que requeriremos I/O de red hacia Redis en lugar de accesos directos e instantáneos a la memoria RAM.
* **Complejidad del Código:** Aumento drástico de la complejidad del backend para manejar sincronización asíncrona, serialización/deserialización de estado y lógicas de reconexión al caché.
