# Architecture

Vue de conception, volontairement sans code, prompts ni schéma. Les valeurs de réglage de production ne sont pas publiées.

## 1. Flux principal d'une question

```mermaid
flowchart TD
    A[Message d'un membre] --> B[Bot : pré-filtrage]
    B --> C[Nettoyage et filtrage d'injections]
    C --> D[Détection de langue, traduction éventuelle vers une langue pivot]
    D --> E[Embedding de la requête]
    E --> F[Cosinus en mémoire sur les chunks du serveur]
    F --> G[Candidats vectoriels]
    G --> H[Reclassement lexical des candidats]
    H --> I[Fusion RRF]
    I --> J{Garde-fou : source exploitable ?}
    J -- oui --> K[Génération de la réponse]
    J -- non --> L[Escalade forcée + résumé pour l'équipe]
    K --> M[Réponse dans la langue de l'utilisateur]
```

Légende : le garde-fou d'évidence est évalué dans le code après la recherche. Un échec force l'escalade quelle que soit la sortie du modèle. Les captures d'écran suivent un chemin parallèle (OCR, puis LLM multimodal en repli) dont le texte est ajouté au contexte.

## 2. Composants

```mermaid
flowchart LR
    subgraph Discord
        MB[Membres]
        ST[Équipe du serveur]
    end
    subgraph Bot[Bot discord.js]
        EV[Événements de messages]
        CM[Commandes]
    end
    subgraph Dash[Tableau de bord SvelteKit]
        AP[API du bot]
        CH[Service de réponse]
        RG[Recherche hybride]
        ING[Ingestion]
        ADM[Pages d'administration]
        TK[Tickets et escalade]
        MET[Suivi scores, latence, coût]
    end
    DB[(MySQL via Prisma)]
    OAI[Embeddings et LLM]
    MB --> EV --> AP --> CH
    CH --> RG --> DB
    CH --> OAI
    ING --> DB
    ING --> OAI
    ADM --> ING
    CH --> TK --> CM
    TK --> ST
    CH --> MET --> DB
```

Légende : le bot ne porte pas la logique de réponse ; elle est centralisée dans le tableau de bord. Les administrateurs alimentent la base (PDF, pages web) et règlent la confiance par serveur. Les salons Discord de connaissance sont lus comme contexte.

## 3. Séquence : une question sans source exploitable

```mermaid
sequenceDiagram
    participant M as Membre
    participant B as Bot
    participant S as Service de réponse
    participant R as Recherche hybride
    participant T as Tickets
    participant E as Équipe
    M->>B: Question
    B->>S: Message + contexte du serveur
    S->>R: Requête sur l'index du serveur
    R-->>S: Candidats, scores, signal d'évidence
    S->>S: Le modèle propose une réponse
    S->>S: Pas de source exploitable : escalade forcée, corps de réponse supprimé
    S->>T: Escalade + résumé de la conversation
    T->>E: Notification avec résumé
    S-->>B: Message d'attente (langue de l'utilisateur)
    B-->>M: Un humain va reprendre
```

Légende : même si le modèle produit une réponse, la décision d'escalade appartient au code. Le résumé évite à l'équipe de relire toute la conversation.

## Notes de conception

- Isolation : chaque requête de recherche est restreinte à l'index du serveur concerné.
- Vecteurs : stockés en base avec le nom du modèle d'embeddings, pour ne comparer que des vecteurs de même modèle pendant une migration.
- Observabilité : scores et latence de recherche, tokens, durée et coût estimé de chaque appel LLM.
