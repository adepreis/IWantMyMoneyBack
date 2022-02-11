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
    cy.get('form').find('[placeholder="Donnez un titre à cette ligne de frais"]').type('restaurant')
    cy.get('form').find('[placeholder="Sélectionnez la date"]').click()
    cy.get('table').last().find('td').eq(15).click()
    cy.wait(1000)
    cy.get('form').find('[placeholder="Sélectionnez le type de frais"]').click()
    cy.contains('REPAS').click()
    cy.get('form').find('[placeholder="Sélectionnez la mission associée"]').click()
    cy.wait(1000)

    let count = 0
    cy.get('div[role=option]').then($elements => {
      count = $elements.length
    })
    cy.get('div[role=option]').eq(count-1)
      .click()
    
    cy.get('form').contains('Montant HT').parent().children().should('have.length', 2).last().clear().type('38.82')
    cy.get('form').contains('Montant TVA').parent().children().should('have.length', 2).last().clear().type('3.88')
    cy.get('form').contains('Faites glisser').parent().parent().parent().click()
    const filepath = 'restau1.jpg'
    cy.get('form').find('input[type=file]').attachFile(filepath)
    cy.get('form').find('textarea').type('Dîner professionnel avec le client')
    cy.get('form').find('button').last().click()
    cy.wait(3000)
  })

  it('Scénario 2 - Modification d\'une ligne de frais', () => {
    cy.get('h3').first().click()
    cy.wait(1000)
    cy.get('tbody').first().find('td').last().find('button').first().click()
    cy.get('[placeholder="Donnez un titre à cette ligne de frais"]').clear().type('Repas professionnel')
    cy.get('input[type="checkbox"]').click()
    cy.get('button').last().click()
    //cy.get('tbody').first().click()
    cy.wait(3000)
  })

  it('Scénario 3 - Suppression d\'une ligne de frais', () => {
    // cy.get('h3').first().click()
    cy.get('tbody').first().find('td').last().find('button').last().click()
    cy.wait(3000)
    cy.get('button').last().click()
    cy.wait(3000)
  })

  it('Scénario 4 - Restauration d\'une ligne de frais', () => {
    // cy.get('h3').first().click()
    cy.get('tbody').first().find('td').last().find('button').last().click()
    cy.wait(2000)
  })

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

  
  // cy.get('td').eq(4).contains('button', 'Edit').click()
  
  // cy.get('button').should('have.length', 3)
  

  // cy.get('.row')
  // .should($row => {
  //   // either fails triggers retry
  //   expect($row.text()).to.match(/a few seconds ago/i)
  //   expect($row.text()).to.match(/confirm your email address/i)
  // })

  // cy.wrap({ foo: 'bar' }).its('foo').should('eq', 'bar')

  // cy.get('div').last().parent().children().eq(count-1)

})