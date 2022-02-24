describe('Soumettre une note de frais - Collaborateur', () => {

  // Conservation des cookies pour éviter de se reconnecter à chaque test
  beforeEach(() => {
    Cypress.Cookies.preserveOnce('next-auth.session-token', 'next-auth.callback-url', 'next-auth.csrf-token');
  })

  it('Connexion', () => {
    // Suppression des cookies si on était précédemment connecté, pour être redirigé à la page d'accueil pour un utilisateur non connecté
    cy.clearCookie('next-auth.session-token');
    cy.clearCookie('next-auth.callback-url');
    cy.clearCookie('next-auth.csrf-token');
    // Visite de l'url du site
    cy.visit('http://localhost:3000')
    // Accès à la page de connexion
    cy.contains('Se connecter').click()
    cy.wait(5000)

    // Insertion des valeurs des champs de connexion pour se connecter
    cy.get('input[name=email]').type('remy.thieffry@pops2122.fr')
    cy.get('input[name=password]').type('Rémy')
    cy.contains('Se connecter').click()
    cy.wait(5000)
    // Vérification que la connexion a réussie
    cy.url().should('eq', 'http://localhost:3000/home/2022')
  })


  it('Soumission d\'une note de frais', () => {
    cy.reload()
    // Changement de mois, en avril
    cy.get('label').eq(3).click()
    cy.wait(5000)

    // Vérification avant soumission de la note
    cy.get('button').should('have.length', 27)

    // Soumission de la note
    cy.get('button').eq(3).click()
    cy.wait(8000)
    // cy.reload()

    // Vérification après soumission
    cy.get('button').should('have.length', 3)
  })


  it('Impossibilité de soumettre une note de frais déjà soumise ou validée', () => {
    cy.visit('http://localhost:3000/home/2021')
    // Changement de mois, en février
    cy.get('label').eq(1).click()
    cy.wait(5000)
    // Vérifications de l'indisponibilité des boutons
    cy.get('button').should('have.length', 2) // 1 + 1/mission
    // Changement de mois, en octobre
    cy.get('label').eq(9).click()
    cy.wait(5000)
    // Vérifications de l'indisponibilité des boutons
    cy.get('button').should('have.length', 2)
  })

})
