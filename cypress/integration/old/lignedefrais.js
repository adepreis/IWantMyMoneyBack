// Mettre des .wait(X) et des .pause(), et des cy.log("message")
// Commenter le code pour bien se repérer

// AIDES
// cy.get('td').eq(4).contains('button', 'Edit').click()
//   cy.get('ul.messages_list').children().should(($children) => {
//     expect($children).to.contain('text');
//     expect($children).to.contain('emailaddress);
//     expect($children.length).to.eq(2);
// })
// cy.wrap({ foo: 'bar' }).its('foo').should('eq', 'bar')
// cy.get('div').last().parent().children().eq(count-1)

describe('Tests sur la connexion', () => {

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
    cy.get('input[name=email]').type('random')
    cy.get('input[name=password]').type('user')
    cy.contains('Se connecter').click()
    cy.pause()
    // Vérification que la connexion a échoué puisque les valeurs sont fausses
    cy.url().should('eq', 'http://localhost:3000/auth/signin?callbackUrl=http://localhost:3000/&error=CredentialsSignin')    
    
    // Insertion des valeurs des champs de connexion pour se connecter
    cy.get('input[name=email]').type('user')
    cy.get('input[name=password]').type('user')
    cy.contains('Se connecter').click()
    cy.pause()
    // Vérification que la connexion a réussie
    cy.url().should('eq', 'http://localhost:3000/home/2022')
  })
})

describe('Tests sur les lignes de frais', () => {

  // Conservation des cookies pour éviter de se reconnecter à chaque test
  beforeEach(() => {
    Cypress.Cookies.preserveOnce('next-auth.session-token', 'next-auth.callback-url', 'next-auth.csrf-token');
  })

  it('Scénario 1  - Créer une ligne de frais', () => {
    // Changement d'année en 2022 (normalement inutile car on est dirigé automatiquement ici après connexion)
    cy.visit('http://localhost:3000/home/2022')
    cy.wait(5000)
    // Vérification de la possibilité de créer une ligne de frais pour le Janvier 2022
    cy.get('button').first().should('not.be.disabled')
    // Création d'une ligne de frais
    cy.get('button').first().click()
    cy.pause()

    // Insertion des valeurs des champs pour créer une ligne de frais
    cy.get('form').find('[placeholder="Donnez un titre à cette ligne de frais"]').type('restaurant')
    cy.get('form').find('[placeholder="Sélectionnez la date"]').click()
    cy.wait(2000)
    cy.get('table').last().find('td').eq(15).click()
    cy.pause()
    cy.get('form').find('[placeholder="Sélectionnez le type de frais"]').click()
    cy.wait(2000)
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
    const filepath = 'restau1.jpg'
    cy.get('form').find('input[type=file]').attachFile(filepath)
    cy.get('form').find('textarea').type('Dîner professionnel avec le client')
    cy.pause()
    // Ajout de la ligne
    cy.get('form').find('button').last().click()
    cy.pause()

    // Sélection de la mission de la note
    cy.get('h3').contains('Davis - Walker').click()
    cy.wait(2000)
    // Vérification de l'affichage de cette ligne de frais dans la note [après ajout / avant clic]
    cy.get('tbody').find('tr').contains('restaurant').parent().children()
      .should('contain', 'restaurant')
      .and('contain', '15-02-2022')
      .and('contain', '38.82 €')
      .and('contain', 'Justificatif')
    // Vérification de l'affichage de cette ligne de frais dans la note [après ajout / après clic]
    cy.get('tbody').find('tr').contains('restaurant').parent().click()
    cy.wait(2000)
    cy.contains('Dîner professionnel avec le client')
    
    // Sauvegarde des modifications sur la note
    cy.get('button').eq(1).click()
    cy.pause()
    // Sélection de la mission de la note
    cy.get('h3').contains('Davis - Walker').click()
    cy.wait(2000)
    // Vérification de l'affichage de cette ligne de frais dans la note [après sauvegarde]
    cy.get('tbody').find('tr').contains('restaurant').parent().children()
      .should('contain', 'restaurant')
      .and('contain', '15-02-2022')
      .and('contain', '38.82 €')
      .and('contain', 'Justificatif')
    cy.get('tbody').find('tr').contains('restaurant').parent().click()
    cy.wait(2000)
    cy.contains('Dîner professionnel avec le client')
    cy.pause()
  })

  it('Scénario 2 - Modifier une ligne de frais', () => {
    // Modification de la ligne
    cy.get('tbody').find('tr').contains('restaurant').parent().children().last().find('button').first().click()
    cy.pause()
    cy.get('[placeholder="Donnez un titre à cette ligne de frais"]').clear().type('Repas professionnel')
    cy.get('input[type="checkbox"]').click()
    cy.get('form').find('textarea').clear()
    cy.pause()
    // Modification de la ligne terminée
    cy.get('button').last().click()
    cy.pause()
    
    // Vérification de l'affichage de cette ligne de frais dans la note [après modification / avant clic]
    cy.get('tbody').find('tr').contains('Repas professionnel').parent().children()
      .should('contain', 'Repas professionnel')
      .and('contain', '15-02-2022')
      .and('contain', '38.82 €') // to fix
      .and('contain', 'Pas de justificatif')
    // Vérification de l'affichage de cette ligne de frais dans la note [après modification / après clic]
    cy.get('tbody').find('tr').contains('Repas professionnel').parent().click()
    cy.contains('Pas de commentaire')
    // Vérification de l'affichage de cette ligne de frais dans la note [après sauvegarde]
    cy.get('button').eq(1).click()
    cy.pause()
    cy.get('h3').contains('Davis - Walker').click()
    cy.wait(2000)
    cy.get('tbody').find('tr').contains('Repas professionnel').parent().children()
      .should('contain', 'Repas professionnel')
      .and('contain', '15-02-2022')
      .and('contain', '38.82 €')
      .and('contain', 'Pas de justificatif')
    cy.get('tbody').find('tr').contains('Repas professionnel').parent().click()
    cy.wait(2000)
    cy.contains('Aucun justificatif n\'a été fournis.')
    cy.contains('Pas de commentaire')
    cy.pause()
  })

  it('Scénario 3 - Supprimer une ligne de frais', () => {
    cy.get('tbody').find('tr').contains('Repas professionnel').parent().children().last().find('button').last().click()
    cy.pause()
    cy.get('button').last().click()
    cy.pause()
  })

  it('Scénario 4 - Restaurer une ligne de frais', () => {
    cy.get('tbody').find('tr').contains('Repas professionnel').parent().children().last().find('button').last().click()
    cy.pause()
  })

  // Beaucoup de bugs:
  // - Chargement infini après suppression d'une note
  // - Cliquer 2 fois le radio button de la demande d'avance pour que ca marche
  // - Affichage de la ligne de demande d'avance non appropriée (des choses qui sont à afficher différemment des simples lignes de frais)
  
  it('Scénario 5 - Demander une avance', () => {
    // Déplacement sur le mois de mars
    cy.get('label').eq(2).click()
    cy.pause()
    // Demande d'avance
    cy.get('button').first().click()
    cy.wait(1000)
    cy.get('form').find('input[type=radio]').last().check()
    cy.get('form').find('input[type=radio]').last().check()
    cy.pause()
    // Remplissage des inputs
    cy.get('form').find('[placeholder="Donnez un titre à cette ligne de frais"]').last().type('Frais de logement')
    cy.get('form').find('[placeholder="Sélectionnez la date"]').click()
    cy.wait(2000)
    cy.get('table').last().find('td').eq(17).click()
    cy.wait(4000)
    cy.get('form').find('[placeholder="Sélectionnez le type de frais"]').click()
    cy.wait(1000)
    cy.contains('LOGEMENT').click()
    cy.get('form').find('[placeholder="Sélectionnez la mission associée"]').click()
    cy.wait(2000)

    let count = 0
    cy.get('div[role=option]').then($elements => {
      count = $elements.length
    })
    cy.get('div[role=option]').eq(count-2) // Sélection de l'avant dernière mission dans la liste
      .click()
    cy.wait(1000)

    cy.get('form').contains('Montant TTC').parent().children().should('have.length', 2).last().clear().type('110')
    cy.pause()
    // Confirmation
    cy.get('form').find('button').last().click()
    // Vérification de l'affichage de cette ligne de frais dans la note [après sauvegarde]
    cy.get('button').eq(1).click()
    cy.wait(5000)
    cy.get('h3').contains('Carroll - Reichert').click()
    cy.wait(2000)
    cy.pause()
  })
})


describe('Tests sur les notes de frais', () => {

  // Conservation des cookies pour éviter de se reconnecter à chaque test
  beforeEach(() => {
    Cypress.Cookies.preserveOnce('next-auth.session-token', 'next-auth.callback-url', 'next-auth.csrf-token');
  })

  it('Scénario 1 - Impossibilité de modifier/supprimer une note de frais envoyée/validée', () => {
    // Changement d'année, en 2021
    cy.get('input').first().click()
    cy.wait(2000)
    cy.contains('2021').click()
    cy.pause()
    // Changement de mois, en mars
    cy.get('label').eq(2).click()
    cy.pause()
    // Vérifications de l'indisponibilité des boutons
    cy.get('button').eq(0).should('be.disabled')
    cy.get('button').eq(1).should('be.disabled')
    // Changement de mois, en mai
    cy.get('label').eq(4).click()
    cy.pause()
    // Vérifications de l'indisponibilité des boutons
    cy.get('button').eq(0).should('be.disabled')
    cy.get('button').eq(1).should('be.disabled')
    cy.pause()
  })

  it('Scénario 2 - Annuler les modifications d\'une note de frais', () => {
    // Changement d'année, en 2018
    cy.visit('http://localhost:3000/home/2018')
    cy.pause()
    cy.get('button').eq(1).should('be.disabled')
    // Changement de mois, en février
    cy.get('label').eq(1).click()
    cy.pause()
    // Observation d'une mission de la note
    cy.get('h3').contains('Tremblay, Berge and Schinner').click()
    cy.wait(2000)
    // Suppression d'une ligne
    cy.get('tbody').find('tr').contains('Bike').parent().children().last().find('button').last().click()
    cy.pause()
    // Confirmation de la suppression de la ligne
    cy.get('button').last().click()
    cy.pause()
    // Vérification de la possibilité de sauvegarder la note car modification faite
    cy.get('button').eq(1).should('not.be.disabled')
    // Changement d'année, en 2019
    cy.get('input').first().click()
    cy.wait(2000)
    cy.contains('2019').click()
    cy.pause()
    // Annuler le changement d'année pour garder les modifications
    cy.get('button').last().should('be.visible').and('not.be.disabled')
    cy.get('button').contains('Annuler').parent().click()
    cy.pause()
    // Changement de mois, en mars
    cy.get('label').eq(2).click()
    cy.pause()
    // Supprimer les modifications faites
    cy.get('button').last().click()
    cy.pause()
    // Changement de mois, en février
    cy.get('label').eq(1).click()
    cy.pause()
    // Vérification que les informations pour la ligne de frais sont toujours identiques
    cy.get('h3').contains('Tremblay, Berge and Schinner').click()
    cy.wait(1000)
    cy.get('tbody').find('tr').contains('Bike').parent().children()
      .should('contain', 'Bike')
      .and('contain', '06-02-2022')
      .and('contain', '69 790.00 €')
      .and('contain', 'Justificatif')
    cy.get('tbody').find('tr').contains('Bike').parent().click()
    cy.wait(2000)
    cy.contains('Pas de commentaire')
    cy.pause()
  })

  it('Scénario 3 - Sauvegarder les modifications d\'une note de frais', () => {
    // On va juste regarder si la ligne de frais précédemment sauvegardée par les scénarios des lignes
    //  de frais est toujours bien la même après toutes les autres manipulations que l'on a pu faire
    cy.visit('http://localhost:3000/home/2022')
    cy.pause()
    cy.get('h3').contains('Davis - Walker').click()
    cy.wait(2000)
    cy.get('tbody').find('tr').contains('Repas professionnel').parent().children()
      .should('contain', 'Repas professionnel')
      .and('contain', '15-02-2022')
      .and('contain', '38.82 €')
      .and('contain', 'Pas de justificatif')
    cy.get('tbody').find('tr').contains('Repas professionnel').parent().click()
    cy.wait(2000)
    cy.contains('Aucun justificatif n\'a été fournis.')
    cy.contains('Pas de commentaire')
    cy.pause()

    // Puis on va supprimer la ligne que l'on a créée au tout début, en n'oubliant pas de sauvegarder.
    // La ligne devrait disparaître.
    cy.get('tbody').find('tr').contains('Repas professionnel').parent().children().last().find('button').last().click()
    cy.wait(3000)
    cy.get('button').last().click()
    cy.wait(3000)
    cy.get('button').eq(1).click()
    cy.pause()
    // Vérification
    cy.get('button').should('have.length', 11) // les 3 premiers + 1/mission + 3/ligne
    cy.pause()
  })

  it('Scénario 4 - Supprimer la note de frais', () => {
    // Changement de mois, en mars
    cy.get('label').eq(2).click()
    cy.pause()
    // Vérification avant suppression de la note
    cy.get('button').should('have.length', 7)
    // Suppression de la note
    cy.get('h3').contains('Carroll - Reichert').click()
    cy.wait(2000)
    cy.get('button').eq(2).click()
    cy.pause()
    cy.get('button').last().click()
    cy.wait(5000)
    // Reload page
    cy.reload()
    cy.pause()
    // Vérification après suppression de la note
    cy.get('label').eq(2).click()
    cy.get('button').should('have.length', 3)
  })
})
