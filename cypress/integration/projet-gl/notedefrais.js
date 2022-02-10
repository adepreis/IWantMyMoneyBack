// /// <reference types="cypress" />

describe('Affichage des notes de frais', () => {
  // beforeEach(() => {
  //   cy.visit('http://localhost:3000')
  // })

  it('Connexion', () => {
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

    cy.get('input').first().click()
    cy.wait(3000)
    cy.contains('2018').click()
    cy.wait(5000)

    // ICI pour l'affichage, les cookies bugs dans cypress ce qui nous ramene a la page d'accueil
    // de la route/home mais dont il faut alors se connecter à nouveau
    cy.get('input').eq(2).click({force:true})
    cy.get('button').last().should('be.disabled')
    cy.get('input').eq(5).click({force:true})
    cy.get('button').last().should('be.disabled')
  })

  // Gros problèmes au niveau de cette branche :
  // - Dans le cas où dans un mois il y a deja au moins une note de frais,
  //  le bouton "sauvegarder" sauvegarde quoi ? car dans un mois où il y a 2 notes de frais,
  //  il n'y a aucune selection de quelle note de frais est à sauvegarder. De même pour le bouton "supprimer".
  // - Dans le cas où il n'y a aucune note pour un mois donné,
  //  le bouton "sauvegarder" est enable. Pourquoi ? Et comment créer une note de frais ?
  // - Plein de cas comme ça encore...

  // tester un .children() si cela existe
  // puis .children().eq(2)
  // éventuellement tester .parent().parent(). ...

})
