/src
│
├── /domain # Capa de dominio (entidades y lógica empresarial pura)
│ ├── /entities # Entidades centrales del negocio
│ └── /repositories # Interfaces para los repositorios (contratos)
│
├── /application # Casos de uso del sistema
│ ├── /use-cases # Casos de uso orquestan entidades y lógica
│ └── /dto # Objetos de transferencia de datos (opcional)
│
├── /infrastructure # Implementaciones externas (DB, servicios, etc.)
│ ├── /database
│ │ ├── /models # Modelos de base de datos (ej: Sequelize/Mongoose)
│ │ └── /repositories # Implementaciones de los repositorios
│ └── /services # Servicios externos (APIs, colas, etc.)
│
├── /interfaces # Interfaces de entrada/salida (Express, GraphQL, etc.) - Todo lo que interactúa con el mundo exterior (HTTP, CLI, eventos, WebSocket, UI, etc.)
│ ├── /http
│ │ ├── /controllers # Lógica que recibe las requests y responde
│ │ ├── /routes # Rutas Express
│ │ └── /middlewares # Middlewares (auth, error handling, etc.)
│ └── /validators # Validaciones de entrada
│
├── /config # Configuraciones de entorno, base de datos, etc.
│
├── /shared # Código reutilizable (helpers, utils, constantes, etc.)
│
└── index.js # Punto de entrada principal
