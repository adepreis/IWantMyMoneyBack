describe('Sauvegarder une note de frais - Collaborateur', () => {

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


  it('Sauvegarde des modifications d\'une note de frais', () => {
    // Changement d'année, en 2021
    cy.get('input').first().click()
    cy.wait(4000)
    cy.contains('2021').click()
    cy.wait(5000)
    // Changement de mois, en aout
    cy.get('label').eq(7).click()
    cy.wait(5000)


    // Ajout d'une ligne de frais
    cy.get('button').eq(1).click()
    cy.wait(2000)

    // Remplissage des valeurs des champs pour créer une ligne de frais
    cy.get('form').find('[placeholder="Donnez un titre à cette ligne de frais"]').type('Dejeuner')
    cy.get('form').find('[placeholder="Sélectionnez la date"]').click()
    cy.wait(2000)
    cy.get('table').last().find('td').eq(25).click()
    cy.wait(5000)
    cy.get('form').find('[placeholder="Sélectionnez le type de frais"]').click()
    cy.wait(3000)
    cy.contains('REPAS').click()
    cy.get('form').find('[placeholder="Sélectionnez la mission associée"]').click()
    cy.wait(2000)

    // Comptage nécessaire pour sélectionner la bonne mission
    let count = 0
    cy.get('div[role=option]').then($elements => {
      count = $elements.length
    })
    cy.get('div[role=option]').eq(count-2) // Sélection de l'avant dernière mission dans la liste
      .click()

    cy.get('form').contains('Montant HT').parent().children().should('have.length', 2).last().clear().type('38.82')
    cy.get('form').contains('Montant TVA').parent().children().should('have.length', 2).last().clear().type('3.88')
    const filepath = 'restaurant2.jpg'
    cy.get('form').find('input[type=file]').attachFile(filepath)
    cy.get('form').find('textarea').type('Déjeuner avec le client')
    cy.wait(5000)

    // Confirmation de l'ajout de la ligne
    cy.get('form').find('button').last().click()
    cy.wait(5000)


    // Vérification de l'affichage de cette ligne de frais dans la note [avant sauvegarde / avant clic]
    cy.get('h3').contains('Consultation 3j Client').click()
    cy.wait(2000)
    cy.get('tbody').find('tr').contains('Dejeuner').parent().children()
      .should('contain', 'Dejeuner')
      .and('contain', '25-02-2022')
      .and('contain', '38.82 €')
      .and('contain', '42.70 €')
    // Vérification de l'affichage de cette ligne de frais dans la note [avant sauvegarde / après clic]
    cy.get('tbody').find('tr').contains('Dejeuner').parent().click()
    cy.wait(2000)
    cy.contains('Déjeuner avec le client')
    
    // Vérification du nombre de "button" APRES creation d'une ligne
    cy.get('button').should('have.length', 19) // +2/ligneModifiable +1/nouvelleMission +5
    // Vérification de la possibilité de sauvegarder la note
    cy.get('button').eq(2).should('not.be.disabled')
    // Vérification de la possibilité de supprimer la note
    cy.get('button').eq(4).should('not.be.disabled')


    // Sauvegarde
    cy.get('button').eq(2).click()
    cy.wait(7000)
    // Vérification du nombre de "button" APRES sauvegarde
    cy.get('button').should('have.length', 19) // les 4 premiers + 1/mission + 3/ligne si modifiables, 1/ligne sinon
    // Vérification de la possibilité de soumettre la note
    cy.get('button').eq(3).should('not.be.disabled')
    // Vérification de l'affichage de cette ligne de frais dans la note [après sauvegarde / avant clic]
    cy.get('h3').contains('Consultation 3j Client').click()
    cy.wait(2000)
    cy.get('tbody').find('tr').contains('Dejeuner').parent().children()
      .should('contain', 'Dejeuner')
      .and('contain', '25-02-2022')
      .and('contain', '38.82 €')
      .and('contain', '42.70 €')
    // Vérification de l'affichage de cette ligne de frais dans la note [après sauvegarde / après clic]
    cy.get('tbody').find('tr').contains('Dejeuner').parent().click()
    cy.wait(2000)
    cy.contains('Déjeuner avec le client')
  })


  it('Impossibilité de modifier une note de frais soumise ou déjà validée', () => {
    cy.reload()
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
