# UML for communication between frontend and backend in main page recipes.

sequenceDiagram
    participant User
    participant Frontend (React App)
    participant API (Express Server)
    participant DB (Database)

    User->>Frontend (React App): Open Recipes Page
    Frontend (React App)->>API (Express Server): GET /recipes
    API (Express Server)->>DB (Database): Query recipes
    DB (Database)-->>API (Express Server): Return recipes data
    API (Express Server)-->>Frontend (React App): JSON response (recipes list)
    Frontend (React App)-->>User: Display recipes

    %% Optional interactions
    User->>Frontend (React App): Search / Filter recipes
    Frontend (React App)->>API (Express Server): GET /recipes?query=...
    API (Express Server)->>DB (Database): Filter query
    DB (Database)-->>API (Express Server): Filtered results
    API (Express Server)-->>Frontend (React App): JSON filtered recipes
    Frontend (React App)-->>User: Update UI

    %% Auth-protected action (optional)
    User->>Frontend (React App): Add Recipe
    Frontend (React App)->>API (Express Server): POST /recipes (with token)
    API (Express Server)->>API (Express Server): Validate token
    API (Express Server)->>DB (Database): Insert recipe
    DB (Database)-->>API (Express Server): Success
    API (Express Server)-->>Frontend (React App): Success response
    Frontend (React App)-->>User: Show confirmation