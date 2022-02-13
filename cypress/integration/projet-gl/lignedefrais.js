describe('Tests applicatifs sur les lignes de frais', () => {
  beforeEach(() => {
    Cypress.Cookies.preserveOnce('next-auth.session-token', 'next-auth.callback-url', 'next-auth.csrf-token');
  })

  it('Connexion', () => {
    cy.clearCookie('next-auth.session-token');
    cy.clearCookie('next-auth.callback-url');
    cy.clearCookie('next-auth.csrf-token');
    cy.visit('http://localhost:3000')
    cy.contains('Se connecter').click()
    //cy.wait(2000)
    cy.get('input[name=email]').type('user')
    cy.get('input[name=password]').type('user')
    //cy.wait(1000)
    cy.contains('Se connecter').click()    
  })


  // AIDES

  // cy.get('td').eq(4).contains('button', 'Edit').click()
  
  // cy.get('button').should('have.length', 3)
  
//   cy.get('ul.messages_list').children().should(($children) => {
//     expect($children).to.contain('text');
//     expect($children).to.contain('emailaddress);
//     expect($children.length).to.eq(2);
// })

// cy.get('ul.messages_list')
//   .children()
//   .should('contain', 'text')
//   .and('contain', 'emailAddress)
//   .and('have.length', 2)

  // cy.wrap({ foo: 'bar' }).its('foo').should('eq', 'bar')

  // cy.get('div').last().parent().children().eq(count-1)

  

})

describe('Tests de vérification et validation sur les lignes de frais', () => {
  beforeEach(() => {
    Cypress.Cookies.preserveOnce('next-auth.session-token', 'next-auth.callback-url', 'next-auth.csrf-token');
  })

  it('Fonctionnalité 7 - Créer une ligne de frais', () => {
    // Changement d'année en 2022
      // cy.get('input').first().click()
      // cy.wait(3000)
      // cy.contains('2022').click({force:true})
      // cy.wait(3000)
      //cy.go('back')
    cy.visit('http://localhost:3000/home/2022')
    cy.wait(5000)
    // Vérification de la possibilité de créer une ligne de frais pour le Janvier 2022
    cy.get('button').first().should('not.be.disabled')
    // Création d'une ligne de frais
    cy.get('button').first().click()
    cy.wait(1000)
    cy.get('form').find('[placeholder="Donnez un titre à cette ligne de frais"]').type('restaurant')
    cy.get('form').find('[placeholder="Sélectionnez la date"]').click()
    cy.wait(2000)
    cy.get('table').last().find('td').eq(15).click()
    cy.wait(1000)
    cy.get('form').find('[placeholder="Sélectionnez le type de frais"]').click()
    cy.wait(2000)
    cy.contains('REPAS').click()
    cy.get('form').find('[placeholder="Sélectionnez la mission associée"]').click()
    cy.wait(3000)

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
    cy.get('form').find('button').last().click()
    cy.wait(2000)
    // Vérification de l'affichage de cette ligne de frais dans la note [après ajout / avant clic]
    cy.get('h3').contains('Davis - Walker').click()
    cy.wait(2000)
    cy.get('tbody').find('tr').contains('restaurant').parent().children()
      .should('contain', 'restaurant')
      .and('contain', '15-02-2022')
      .and('contain', '38.82 €')
      .and('contain', 'Justificatif')
    // Vérification de l'affichage de cette ligne de frais dans la note [après ajout / après clic]
    cy.get('tbody').find('tr').contains('restaurant').parent().click()
    cy.wait(2000)
    //cy.contains('Aucun justificatif n\'a été fournis.')
    cy.contains('Dîner professionnel avec le client')
    // Vérification de l'affichage de cette ligne de frais dans la note [après sauvegarde]
    cy.get('button').eq(1).click()
    cy.wait(5000)
    cy.get('h3').contains('Davis - Walker').click()
    cy.wait(2000)
    cy.get('tbody').find('tr').contains('restaurant').parent().children()
      .should('contain', 'restaurant')
      .and('contain', '15-02-2022')
      .and('contain', '42.70 €') // to fix
      .and('contain', 'Justificatif')
    cy.get('tbody').find('tr').contains('restaurant').parent().click()
    cy.wait(2000)
    //cy.contains('Aucun justificatif n\'a été fournis.')
    cy.contains('Dîner professionnel avec le client')
  })

  it('Fonctionnalité 8 - Modifier une ligne de frais', () => {
    cy.get('tbody').find('tr').contains('restaurant').parent().children().last().find('button').first().click()
    cy.wait(3000)
    cy.get('[placeholder="Donnez un titre à cette ligne de frais"]').clear().type('Repas professionnel')
    cy.get('input[type="checkbox"]').click()
    cy.get('form').find('textarea').clear()
    cy.get('button').last().click()
    cy.wait(3000)
    // Vérification de l'affichage de cette ligne de frais dans la note [après modification / avant clic]
    cy.pause()
    cy.get('tbody').find('tr').contains('Repas professionnel').parent().children()
      .should('contain', 'Repas professionnel')
      .and('contain', '15-02-2022')
      .and('contain', '42.70 €') // to fix
      .and('contain', 'Pas de justificatif')
    // Vérification de l'affichage de cette ligne de frais dans la note [après modification / après clic]
    cy.get('tbody').find('tr').contains('Repas professionnel').parent().click()
    cy.contains('Aucun justificatif n\'a été fournis.')
    cy.contains('Pas de commentaire')
    // Vérification de l'affichage de cette ligne de frais dans la note [après sauvegarde]
    cy.get('button').eq(1).click()
    cy.wait(5000)
    cy.get('h3').contains('Davis - Walker').click()
    cy.wait(3000)
    cy.get('tbody').find('tr').contains('Repas professionnel').parent().children()
      .should('contain', 'Repas professionnel')
      .and('contain', '15-02-2022')
      .and('contain', '42.70 €') // to fix
      .and('contain', 'Pas de justificatif')
    cy.get('tbody').find('tr').contains('Repas professionnel').parent().click()
    cy.wait(2000)
    cy.contains('Aucun justificatif n\'a été fournis.')
    cy.contains('Pas de commentaire')
  })

  // TODO - a verifier

  it('Scénario 3 - Suppression d\'une ligne de frais', () => {
    // cy.get('h3').first().click()
    cy.get('tbody').find('tr').contains('restaurant').parent().children().last().find('button').last().click()
    cy.wait(3000)
    cy.get('button').last().click()
    cy.wait(3000)
  })

  it('Scénario 4 - Restauration d\'une ligne de frais', () => {
    // cy.get('h3').first().click()
    cy.get('tbody').find('tr').contains('restaurant').parent().children().last().find('button').last().click()
    cy.wait(2000)
  })

  // TODO - a faire


  // Tests pour la branche note de frais
  // Bugs : il faut forcement reload ou changer de mois pour terminer le chargement infini d'affichage
  //  après avoir supprimé une note

  it('Scénario 5 - Impossibilité de modification/suppression pour une note de frais envoyée/validée', () => {
    cy.get('input').first().click()
    cy.wait(3000)
    cy.contains('2021').click()
    cy.wait(3000)
    cy.get('button').contains('Suppression des modifications').click()
    cy.wait(3000)
    cy.get('label').eq(2).click()
    cy.wait(5000)
    cy.get('button').eq(0).should('be.disabled')
    cy.get('button').eq(1).should('be.disabled')
    cy.get('label').eq(4).click()
    cy.get('button').eq(0).should('be.disabled')
    cy.get('button').eq(1).should('be.disabled')
  })

  


})