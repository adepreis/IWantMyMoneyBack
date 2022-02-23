// /// <reference types="cypress" />

describe('Affichage des notes de frais', () => {
  beforeEach(() => {
    Cypress.Cookies.preserveOnce('next-auth.session-token', 'next-auth.callback-url', 'next-auth.csrf-token');
  })

  it('Connexion', () => {
    cy.clearCookie('next-auth.session-token');
    cy.clearCookie('next-auth.callback-url');
    cy.clearCookie('next-auth.csrf-token');
    cy.visit('http://localhost:3000')
    cy.contains('Se connecter').click()
    cy.wait(3000)
    cy.get('input[name=email]').type('user')
    cy.get('input[name=password]').type('user')
    cy.wait(3000)
    cy.contains('Se connecter').click()    
  })

  it('Impossibilité de supprimer une note de frais envoyée/validée', () => {
    cy.get('button').should('have.length', 3)
    cy.get('input').first().click()
    cy.wait(3000)
    cy.contains('2021').click()
    cy.wait(5000)

    cy.get('input').eq(2).click({force:true})
    cy.get('button').last().should('be.disabled')
    cy.get('input').eq(5).click({force:true})
    cy.get('button').last().should('be.disabled')
  })

  // tester un .children() si cela existe
  // puis .children().eq(2)
  // éventuellement tester .parent().parent(). ...

})
