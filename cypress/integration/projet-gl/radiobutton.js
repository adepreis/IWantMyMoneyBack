describe('Test applicatif sur l\'ppui du radiobutton pour les avances', () => {

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('next-auth.session-token', 'next-auth.callback-url', 'next-auth.csrf-token');
  })

  it('Connexion', () => {
    cy.clearCookie('next-auth.session-token');
    cy.clearCookie('next-auth.callback-url');
    cy.clearCookie('next-auth.csrf-token');
    cy.visit('http://localhost:3000')
    cy.contains('Se connecter').click()
    cy.wait(2000)
    
    cy.get('input[name=email]').type('user')
    cy.get('input[name=password]').type('user')
    cy.contains('Se connecter').click()
    cy.wait(4000)
    cy.url().should('eq', 'http://localhost:3000/home/2022')
  })


  it('Scénario 5 - Demander une avance', () => {
    cy.get('label').eq(2).click()
    cy.wait(2000)
    cy.get('button').first().click()
    cy.wait(1000)
    cy.get('form').find('input[type=radio]').last().check()
    cy.get('form').find('input[type=radio]').last().check()
    cy.wait(5000)
    cy.pause()
    cy.get('form').find('[placeholder="Donnez un titre à cette ligne de frais"]').last().type('Frais de logement')
    cy.get('form').find('[placeholder="Sélectionnez la date"]').click()
    cy.wait(2000)
    cy.get('table').last().find('td').eq(17).click()
    cy.wait(1000)
    cy.get('form').find('[placeholder="Sélectionnez le type de frais"]').click()
    cy.wait(2000)
    cy.contains('LOGEMENT').click()
    cy.get('form').find('[placeholder="Sélectionnez la mission associée"]').click()
    cy.wait(3000)

    let count = 0
    cy.get('div[role=option]').then($elements => {
      count = $elements.length
    })
    cy.get('div[role=option]').eq(count-2) // Sélection de l'avant dernière mission dans la liste
      .click()
    cy.wait(1000)

    cy.get('form').contains('Montant TTC').parent().children().should('have.length', 2).last().clear().type('110')
    cy.get('form').find('button').last().click()
    cy.wait(2000)
    // Vérification de l'affichage de cette ligne de frais dans la note [après sauvegarde]
    cy.get('button').eq(1).click()
    cy.wait(5000)
    cy.get('h3').contains('Carroll - Reichert').click()
    cy.wait(2000)
  })


  // AIDES

  // cy.get('td').eq(4).contains('button', 'Edit').click()
  
//   cy.get('ul.messages_list').children().should(($children) => {
//     expect($children).to.contain('text');
//     expect($children).to.contain('emailaddress);
//     expect($children.length).to.eq(2);
// })

  // cy.wrap({ foo: 'bar' }).its('foo').should('eq', 'bar')

  // cy.get('div').last().parent().children().eq(count-1)


})
