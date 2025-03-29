src/
│
├── domain/
│ ├── entities/
│ │ └── User.ts // Entidad del dominio: User
│ └── repositories/
│ └── UserRepository.ts // Contrato del repositorio de usuarios
│
├── application/
│ ├── use-cases/
│ │ └── RegisterUser.ts // Caso de uso: registro de usuario
│ └── dto/
│ └── UserDTO.ts // Data Transfer Object del usuario
│
├── infrastructure/
│ ├── database/
│ │ ├── models/
│ │ │ └── UserModel.ts // Entidad TypeORM para usuarios
│ │ └── repositories/
│ │ └── UserRepoImpl.ts // Implementación del repositorio con TypeORM
│ └── services/
│ └── AuthService.ts // Servicio de autenticación con bcrypt y JWT
│
├── interfaces/
│ ├── http/
│ │ ├── controllers/
│ │ │ └── UserController.ts // Controlador HTTP de usuarios
│ │ ├── routes/
│ │ │ └── userRoutes.ts // Rutas relacionadas a usuarios
│ │ └── middlewares/
│ │ ├── authMiddleware.ts // Middleware de autenticación JWT
│ │ └── errorHandler.ts // Middleware de manejo de errores
│ └── validators/
│ └── userValidator.ts // Validación de entrada para registro/login
│
├── config/
│ ├── db.ts // Configuración de TypeORM
│ └── env.ts // Carga y exporta variables de entorno
│
├── shared/
│ ├── constants.ts // Constantes globales
│ └── utils.ts // Funciones auxiliares
│
├── index.ts // Punto de entrada de la app (Express)
└── tsconfig.json // Configuración TypeScript
