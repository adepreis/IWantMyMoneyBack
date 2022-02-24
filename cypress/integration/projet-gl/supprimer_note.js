describe('Supprimer une note de frais - Collaborateur', () => {

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


  it('Suppression des modifications d\'une note de frais', () => {
    // Direction 2020
    cy.visit('http://localhost:3000/home/2020')
    cy.wait(5000)
    // Changement de mois, en décembre
    cy.get('label').eq(11).click()
    cy.wait(5000)

    // Vérification avant suppression de la note
    cy.get('button').should('have.length', 16)

    // Suppression de la note
    cy.get('button').eq(4).click()
    cy.wait(2000)
    cy.get('button').last().click()
    cy.wait(5000)
    // Reload page
    cy.reload()
    cy.wait(5000)
    // Vérification après suppression de la note
    cy.get('label').eq(11).click()
    cy.get('button').should('have.length', 5)

    // Vérification de l'impossibilité de sauvegarder la note
    cy.get('button').eq(2).should('be.disabled')
    // Vérification de l'impossibilité de soumettre la note
    cy.get('button').eq(3).should('be.disabled')
  })


  it('Impossibilité de supprimer une note de frais soumise ou déjà validée', () => {
    cy.reload()
    // Changement de mois, en avril
    cy.get('label').eq(3).click()
    cy.wait(5000)
    // Vérifications de l'indisponibilité des boutons
    cy.get('button').should('have.length', 3) // 1 + 1/mission
    // Changement de mois, en mai
    cy.get('label').eq(4).click()
    cy.wait(5000)
    // Vérifications de l'indisponibilité des boutons
    cy.get('button').should('have.length', 2)
  })

})
