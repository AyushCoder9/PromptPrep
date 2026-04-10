```mermaid
usecaseDiagram
    actor Student
    actor "Professor (Admin)" as Professor
    actor "AI Service" as AI

    package "PromptPrep System" {
        usecase "Upload Material" as UC1
        usecase "Generate Quiz" as UC2
        usecase "Export Flashcards" as UC3
        usecase "Query Concept" as UC4
        usecase "View History" as UC5
        usecase "Retrieve Context" as UC6
    }

    Student --> UC1
    Student --> UC2
    Student --> UC3
    Student --> UC4
    Student --> UC5

    Professor --> UC1
    Professor --> UC5

    UC2 ..> UC6 : <<include>>
    UC3 ..> UC6 : <<include>>
    UC4 ..> UC6 : <<include>>

    UC2 --> AI
    UC3 --> AI
    UC4 --> AI
```
