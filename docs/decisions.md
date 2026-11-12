# Décisions de conception

Format : contexte, choix, alternatives écartées, limites. Aucune valeur de réglage de production n'est donnée.

## 1. MySQL pour stocker les vecteurs

- **Contexte** : le projet était déjà sur MySQL et l'hébergement limitait les services installables ; la base de connaissances de chaque serveur reste de taille modeste.
- **Choix** : stocker les embeddings dans MySQL (sérialisés avec le nom du modèle) et calculer le cosinus en mémoire dans l'application.
- **Alternatives écartées** : pgvector, Qdrant ou un autre moteur vectoriel dédié, jugés plus lourds à héberger dans ces conditions.
- **Limites** : le coût d'une requête croît avec le nombre de chunks du serveur, avec un plafond de chunks chargés. Au-delà d'environ 200 Mo (ordre de grandeur de l'auteur), il faudrait un moteur vectoriel dédié.

## 2. Un index logique par serveur

- **Contexte** : chaque serveur Discord a sa propre documentation et ne doit jamais voir celle d'un autre.
- **Choix** : toutes les lectures de chunks sont restreintes à l'identifiant du serveur ; pas de recherche globale.
- **Alternatives écartées** : un index partagé avec filtrage a posteriori.
- **Limites** : pas de mutualisation de connaissances communes entre serveurs ; l'isolation repose sur la discipline de filtrage dans chaque requête.

## 3. Reclassement lexical limité aux candidats vectoriels, fusion RRF

- **Contexte** : les embeddings ratent parfois les termes exacts (noms de commandes, références) ; un second index lexical aurait ajouté une brique à héberger.
- **Choix** : recalculer, sur les candidats vectoriels seulement, la fraction des termes de la requête présents dans le chunk (mot entier), puis fusionner les deux classements par RRF.
- **Alternatives écartées** : recherche lexicale indépendante sur toute la base (index plein texte), moyenne pondérée de scores, reclassement par modèle dédié.
- **Limites** : le lexical reclasse sans élargir, donc un chunk absent des candidats vectoriels reste invisible. Le score lexical ignore la fréquence et la rareté des termes. Le filtrage des mots vides n'existe que dans la version la plus récente du tableau de bord.

## 4. Escalade appliquée dans le code

- **Contexte** : une consigne de prompt « ne réponds pas sans source » n'est pas respectée à tous les coups.
- **Choix** : après la recherche, le code évalue si une source exploitable existe ; sinon il force l'escalade et supprime la réponse du modèle, puis transmet un résumé à l'équipe. Dans la version la plus récente, ce signal compare le meilleur cosinus à la distribution des cosinus du serveur ; la version plus ancienne se fonde sur des seuils de confiance et un recoupement de mots.
- **Alternatives écartées** : s'en remettre au seul prompt ; seuil unique de cosinus brut, plus sensible à l'échelle du modèle d'embeddings.
- **Limites** : le seuil du signal dépend de la géométrie du modèle d'embeddings et doit être recalibré à chaque changement de modèle. Trop strict, il escalade des questions auxquelles la base répond ; trop lâche, il laisse passer des réponses faibles.

## 5. Captures d'écran : OCR d'abord, LLM multimodal en repli

- **Contexte** : les utilisateurs joignent souvent des captures d'erreurs.
- **Choix** : OCR local en premier ; si le texte est insuffisant ou si l'OCR échoue, appel à un LLM multimodal.
- **Alternatives écartées** : LLM multimodal systématique (plus coûteux et plus lent).
- **Limites** : l'OCR se trompe sur les captures bruitées ; le repli ajoute coût et latence ; le contenu d'une image reste une entrée non fiable pour les injections.

## 6. Réglages de confiance par serveur

- **Contexte** : les bases de connaissances et la tolérance au risque diffèrent d'un serveur à l'autre.
- **Choix** : un seuil de confiance propre à chaque serveur, modifiable depuis le tableau de bord.
- **Alternatives écartées** : un seuil global unique.
- **Limites** : les administrateurs règlent sans outil de calibration guidée ; un mauvais réglage dégrade la qualité sans alerte automatique.
