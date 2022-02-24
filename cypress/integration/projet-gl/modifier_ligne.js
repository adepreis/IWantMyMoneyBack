describe('Modifier une ligne de frais - Collaborateur', () => {

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


  it('Modification d\'une ligne de frais de remboursement', () => {
    // Changement d'année, en 2021
    cy.get('input').first().click()
    cy.wait(2000)
    cy.contains('2021').click()
    cy.wait(5000)
    // Changement de mois, en aout
    cy.get('label').eq(7).click()
    cy.wait(5000)

    // Modification de la ligne
    cy.get('h3').contains('Visite usine de production').click()
    cy.wait(2000)
    cy.get('tbody').find('tr').contains('Restaurant').parent().children().last().find('button').first().click()
    cy.wait(3000)
    cy.get('[placeholder="Donnez un titre à cette ligne de frais"]').clear().type('Repas professionnel')
    cy.get('input[type="checkbox"]').click()
    cy.get('form').find('textarea').clear()
    // Modification de la ligne terminée
    cy.get('form').find('button').last().click()
    cy.wait(3000)

    // Vérification de l'affichage de cette ligne de frais dans la note [après modification / avant clic]
    cy.get('tbody').find('tr').contains('Repas professionnel').parent().children()
      .should('contain', 'Repas professionnel')
      .and('contain', '18-02-2022')
      .and('contain', '29.44 €')
      .and('contain', '40.44 €')
    // Vérification de l'affichage de cette ligne de frais dans la note [après modification / après clic]
    cy.get('tbody').find('tr').contains('Repas professionnel').parent().click()
    cy.wait(2000)
    cy.contains('Pas de commentaire')
    
    // Vérification du nombre de "button" APRES modification d'une ligne
    cy.get('button').should('have.length', 16) // +2/ligneModifiable +1/nouvelleMission +5
    // Vérification de la possibilité de sauvegarder la note
    cy.get('button').eq(2).should('not.be.disabled')
    // Vérification de la possibilité de supprimer la note
    cy.get('button').eq(4).should('not.be.disabled')

    // Changement de mois, en juillet
    cy.get('label').eq(6).click()
    cy.wait(5000)
    // Vérification d'affichage d'un pop-up de rappel, et cliquer sur Annuler
    cy.contains('button','Annuler').click()
    // // Changement d'année, en 2020
    // cy.get('input').first().click()
    // cy.wait(5000)
    // cy.contains('2020').click()
    // cy.wait(5000)
    // // Vérification d'affichage d'un pop-up de rappel, et cliquer sur Annuler
    // cy.contains('button','Annuler').parent().click()
  })

})
