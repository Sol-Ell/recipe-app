# UML for communication between frontend and backend in main page recipes.

sequenceDiagram
    participant User
    participant Frontend (React App)
    participant API (Express Server)
    participant DB (Database)

    %% Step 1: User opens the main page
    User->>Frontend (React App): Open Recipes Page

    %% Step 2: Check if user is logged in (token validation)
    Frontend (React App)->>Frontend (React App): Check local storage / context for token

    alt Token exists (User logged in)
        Frontend (React App)->>API (Express Server): GET /auth/verify (with token)
        API (Express Server)->>API (Express Server): Validate token
        alt Token valid
            API (Express Server)-->>Frontend (React App): 200 OK (user info)
            Frontend (React App)->>Frontend (React App): Set user as authenticated
        else Token invalid/expired
            API (Express Server)-->>Frontend (React App): 401 Unauthorized
            Frontend (React App)->>Frontend (React App): Clear token, set user as guest
        end
    else No token (Guest user)
        Frontend (React App)->>Frontend (React App): Set user as guest / not logged in
    end

    %% Step 3: Fetch recipes (with or without auth)
    Frontend (React App)->>API (Express Server): GET /recipes (include token if exists)
    API (Express Server)->>DB (Database): Query recipes
    
    alt User is logged in
        DB (Database)-->>API (Express Server): Return recipes + user favorites
    else User is guest
        DB (Database)-->>API (Express Server): Return recipes only
    end
    
    API (Express Server)-->>Frontend (React App): JSON response (recipes list, favorites if logged in)
    Frontend (React App)-->>User: Display recipes + show/hide favorite buttons based on login status

    %% Optional: Search / Filter recipes
    User->>Frontend (React App): Search / Filter recipes
    Frontend (React App)->>API (Express Server): GET /recipes?query=...
    API (Express Server)->>DB (Database): Filter query
    DB (Database)-->>API (Express Server): Filtered results
    API (Express Server)-->>Frontend (React App): JSON filtered recipes
    Frontend (React App)-->>User: Update UI

    %% Optional: Add Recipe (requires login)
    User->>Frontend (React App): Add Recipe

    alt User is logged in
        Frontend (React App)->>API (Express Server): POST /recipes (with token)
        API (Express Server)->>API (Express Server): Validate token
        API (Express Server)->>DB (Database): Insert recipe
        DB (Database)-->>API (Express Server): Success
        API (Express Server)-->>Frontend (React App): Success response
        Frontend (React App)-->>User: Show confirmation
    else User is not logged in
        Frontend (React App)-->>User: Redirect to login page / Show login modal
    end