describe('Créer une ligne de frais - Collaborateur', () => {

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


  it('Création d\'une ligne de frais de remboursement', () => {
    // Changement d'année, en 2021
    cy.get('input').first().click()
    cy.wait(2000)
    cy.contains('2021').click()
    cy.wait(5000)
    // Changement de mois, en aout
    cy.get('label').eq(7).click()
    cy.wait(5000)

    // Vérification de la possibilité de créer une ligne de frais pour le aout 2021
    cy.get('button').eq(1).should('not.be.disabled')
    // Stockage du nombre de "button" AVANT ajout d'une ligne
    let buttonCount = 0
    cy.get('button').then($elements => {
      buttonCount = $elements.length // 16
    })
    // Vérification du nombre de "button" AVANT ajout d'une ligne
    cy.get('button').should('have.length', 16)

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
    cy.get('div[role=option]').eq(count-1) // Sélection de la dernière mission dans la liste
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

    // Sélection de la mission de la note
    cy.get('h3').contains('Formation au nouveau logiciel').click()
    cy.wait(2000)
    // Vérification de l'affichage de cette ligne de frais dans la note [après ajout / avant clic]
    cy.get('tbody').find('tr').contains('Dejeuner').parent().children()
      .should('contain', 'Dejeuner')
      .and('contain', '25-02-2022')
      .and('contain', '38.82 €')
      .and('contain', '42.70 €')
      .and('contain', 'repas')
    // Vérification de l'affichage de cette ligne de frais dans la note [après ajout / après clic]
    cy.get('tbody').find('tr').contains('Dejeuner').parent().click()
    cy.wait(2000)
    cy.contains('Déjeuner avec le client')

    // Vérification du nombre de "button" APRES ajout d'une ligne
    cy.get('button').should('have.length', (16 + 3)) // +2/ligneModifiable +1/nouvelleMission
    // Vérification de la possibilité de sauvegarder la note
    cy.get('button').eq(2).should('not.be.disabled')
    // Vérification de la possibilité de supprimer la note
    cy.get('button').eq(4).should('not.be.disabled')

    // Changement de mois, en juillet
    cy.get('label').eq(6).click()
    cy.wait(5000)
    // Vérification d'affichage d'un pop-up de rappel, et cliquer sur Annuler
    cy.get('button').contains('Annuler').parent().click()
    // // Changement d'année, en 2020
    // cy.get('input').first().click()
    // cy.wait(5000)
    // cy.contains('2020').click()
    // cy.wait(5000)
    // // Vérification d'affichage d'un pop-up de rappel, et cliquer sur Annuler
    // cy.get('button').contains('Annuler').parent().click()
    
    // Ajout d'une ligne de frais
    cy.get('button').eq(1).click()
    cy.wait(2000)

    // Remplissage
    cy.get('form').find('[placeholder="Donnez un titre à cette ligne de frais"]').type('Test')
    cy.get('form').find('[placeholder="Sélectionnez la date"]').click()
    cy.get('form').find('[placeholder="Sélectionnez la date"]').click()
    cy.wait(3000)
    cy.get('table').last().find('td').eq(25).click()
    cy.wait(5000)
    cy.get('form').find('[placeholder="Sélectionnez le type de frais"]').click()
    cy.wait(3000)
    cy.contains('REPAS').click()
    cy.get('form').find('[placeholder="Sélectionnez la mission associée"]').click()
    cy.wait(2000)

    // Comptage nécessaire pour sélectionner la bonne mission
    let count2 = 0
    cy.get('div[role=option]').then($elements => {
      count2 = $elements.length
    })
    cy.get('div[role=option]').eq(count2-2) // Sélection de l'avant dernière mission dans la liste
      .click()

    cy.get('form').contains('Montant HT').parent().children().should('have.length', 2).last().clear().type('-38.82')
    cy.get('form').contains('Montant TVA').parent().children().should('have.length', 2).last().clear().type('-3.88')
    const filepath2 = 'restaurant2.jpg'
    cy.get('form').find('input[type=file]').attachFile(filepath2)
    cy.get('form').find('textarea').type('Déjeuner avec le client')
    cy.wait(5000)


    // Vérification que le titre doit faire une taille de 5 caractères minimum
    cy.get('form').find('button').last().click()
    cy.wait(2000)
    cy.get('form').find('[placeholder="Donnez un titre à cette ligne de frais"]').should('be.visible')
    // Vérification que les montants doivent être strictement positifs
    cy.get('form').find('[placeholder="Donnez un titre à cette ligne de frais"]').clear().type('Testing')
    cy.get('form').find('button').last().click()
    cy.wait(2000)
    cy.get('form').find('[placeholder="Donnez un titre à cette ligne de frais"]').should('be.visible')
    // Vérification que la confirmation marche ssi tous les champs sont correctement renseignés
    cy.get('form').contains('Montant HT').parent().children().should('have.length', 2).last().clear().type('38.82')
    cy.get('form').contains('Montant TVA').parent().children().should('have.length', 2).last().clear().type('3.88')
    cy.get('form').find('button').last().click()
    cy.wait(2000)
    cy.get('button').first().should('be.visible')
  })


  it('Création d\'une ligne de demande d\'avance', () => {
    cy.reload()
    cy.wait(3000)
    // Déplacement sur le mois d'aout
    cy.get('label').eq(7).click()
    cy.wait(5000)

    // Demande d'avance
    cy.get('button').eq(1).click()
    cy.wait(2000)
    cy.get('form').find('input[type=radio]').last().check()
    cy.get('form').find('input[type=radio]').last().check()
    cy.wait(2000)

    // Remplissage des inputs
    cy.get('form').find('[placeholder="Donnez un titre à cette ligne de frais"]').last().type('Frais de logement')
    cy.get('form').find('[placeholder="Sélectionnez la date"]').click()
    cy.wait(2000)
    cy.get('table').last().find('td').eq(13).click()
    cy.wait(4000)
    cy.get('form').find('[placeholder="Sélectionnez le type de frais"]').click()
    cy.wait(1000)
    cy.contains('LOGEMENT').click()
    cy.get('form').find('[placeholder="Sélectionnez la mission associée"]').click()
    cy.wait(2000)

    let count3 = 0
    cy.get('div[role=option]').then($elements => {
      count3 = $elements.length
    })
    cy.get('div[role=option]').eq(count3-2) // Sélection de l'avant dernière mission dans la liste
      .click()
    cy.wait(1000)

    cy.get('form').contains('Montant TTC').parent().children().should('have.length', 2).last().clear().type('100')

    // Confirmation
    cy.get('form').find('button').last().click()
    // Vérification de l'affichage de cette ligne de frais dans la note
    cy.get('h3').contains('Consultation 3j Client').click()
    cy.get('tbody').find('tr').contains('Frais de logement').parent().children()
      .should('contain', 'Frais de logement')
      .and('contain', '13-02-2022')
      .and('contain', '0.00 €')
      .and('contain', '100.00 €')
  })

})
