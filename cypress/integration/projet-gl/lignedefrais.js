describe('Tests sur les lignes de frais', () => {
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

  it('Scénario 1 - Création d\'une ligne de frais', () => {
    cy.get('button').first().click()
    cy.get('[placeholder="Donnez un titre à cette ligne de frais"]').type('restaurant')
    cy.get('[placeholder="Sélectionnez la date"]').click()
    cy.get('table').find('td').eq(15).click()
    cy.wait(1000)
    cy.get('[placeholder="Sélectionnez le type de frais"]').click()
    cy.contains('REPAS').click()
    cy.get('[placeholder="Sélectionnez la mission associée"]').click()
    cy.contains('Davis - Walker').click()
    cy.contains('Montant HT').parent().children().should('have.length', 2).last().clear().type('38.82')
    cy.contains('Montant TVA').parent().children().should('have.length', 2).last().clear().type('3.88')
    cy.contains('Faites glisser').parent().parent().parent().click()
    const filepath = 'restau1.jpg'
    cy.get('input[type="file"]').attachFile(filepath)
    cy.get('textarea').type('Dîner professionnel avec le client')
    cy.get('button').last().click()
    cy.wait(3000)
  })

  it('Scénario 2 - Modification d\'une ligne de frais', () => {
    cy.get('h3').first().click()
    cy.get('tbody').first().find('td').last().find('button').first().click()
    // cy.get('[placeholder="Donnez un titre à cette ligne de frais"]').type('restaurant')
    // cy.get('[placeholder="Sélectionnez la date"]').click()
    // cy.get('table').find('td').eq(15).click()
    // cy.wait(1000)
    // cy.get('[placeholder="Sélectionnez le type de frais"]').click()
    // cy.contains('REPAS').click()
    // cy.get('[placeholder="Sélectionnez la mission associée"]').click()
    // cy.contains('Davis - Walker').click()
    // cy.contains('Montant HT').parent().children().should('have.length', 2).last().clear().type('30')
    // cy.contains('Montant TVA').parent().children().should('have.length', 2).last().clear().type('3')
    // cy.contains('Faites glisser').parent().parent().parent().click()
    // const filepath = 'restau1.jpg'
    // cy.get('input[type="file"]').attachFile(filepath)
    // cy.get('textarea').type('Dîner professionnel avec le client')
    // cy.get('button').last().click()
  })

  // .within(() => {
  //   // all searches are automatically rooted to the found tr element
  //   cy.get('td').eq(1).contains('My first project')
  //   cy.get('td').eq(2).contains('0')
  //   cy.get('td').eq(3).contains('Active')
  //   cy.get('td').eq(4).contains('button', 'Edit').click()
  // })

  // cy.get('input').eq(2).click({force:true})
  // cy.get('button').last().should('be.disabled')

  // cy.wrap({ foo: 'bar' }).its('foo').should('eq', 'bar')

})