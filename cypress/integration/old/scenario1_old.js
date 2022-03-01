describe('Scénario 1 - Un collaborateur gère ses notes de frais', () => {

  // Conservation des cookies pour éviter de se reconnecter à chaque test
  beforeEach(() => {
    Cypress.Cookies.preserveOnce('next-auth.session-token', 'next-auth.callback-url', 'next-auth.csrf-token');
  })

  it('En tant que collaborateur, je souhaite me rendre sur le site afin de gérer mes notes de frais. Je me rends donc sur le site et essaye de me connecter.', () => {
    // Suppression des cookies si on était précédemment connecté, pour être redirigé à la page d'accueil pour un utilisateur non connecté
    cy.clearCookie('next-auth.session-token');
    cy.clearCookie('next-auth.callback-url');
    cy.clearCookie('next-auth.csrf-token');
    // Visite de l'url du site
    cy.visit('http://localhost:3000')
    cy.pause()
    // Accès à la page de connexion
    cy.contains('Se connecter').click()
    cy.pause()

    // Remplissage des champs de connexion pour se connecter
    cy.get('input[name=email]').type('random.user@pops2122.fr')
    cy.get('input[name=password]').type('random')
    cy.contains('Se connecter').click()
    // Vérification que la connexion a échoué puisque les valeurs sont fausses
    cy.url().should('eq', 'http://localhost:3000/auth/signin?callbackUrl=http://localhost:3000/&error=CredentialsSignin')    
    cy.pause()

    // Remplissage des champs de connexion pour se connecter
    cy.get('input[name=email]').type('remy.thieffry@pops2122.fr')
    cy.get('input[name=password]').type('Rémy')
    cy.contains('Se connecter').click()
    // Vérification que la connexion a réussie
    cy.url().should('eq', 'http://localhost:3000/home/2022')

    cy.pause()
  })

  it('Je décide de créer une nouvelle note de frais. Je vais donc créer une ligne de frais.', () => {
    // Changement de mois, en Juin
    cy.get('label').eq(5).click()
    cy.pause()
    // Vérification de la possibilité de créer une ligne de frais pour le Juin 2022
    cy.get('button').first().should('not.be.disabled')
    // Création d'une ligne de frais
    cy.get('button').first().click()
    cy.pause()

    // Remplissage des valeurs des champs pour créer une ligne de frais
    cy.get('form').find('[placeholder="Donnez un titre à cette ligne de frais"]').type('Restaurant')
    cy.get('form').find('[placeholder="Sélectionnez la date"]').click()
    cy.wait(2000)
    cy.get('table').last().find('td').eq(25).click()
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
    const filepath = 'restaurant2.jpg'
    cy.get('form').find('input[type=file]').attachFile(filepath)
    cy.get('form').find('textarea').type('Déjeuner avec le client')
    cy.pause()
    // Ajout de la ligne
    cy.get('form').find('button').last().click()
    cy.pause()

    // Sélection de la mission de la note
    cy.get('h3').contains('Formation au nouveau logiciel').click()
    cy.wait(2000)
    // Vérification de l'affichage de cette ligne de frais dans la note [après ajout / avant clic]
    cy.get('tbody').find('tr').contains('Restaurant').parent().children()
      .should('contain', 'Restaurant')
      .and('contain', '25-02-2022')
      .and('contain', '38.82 €')
      .and('contain', 'Justificatif')
    // Vérification de l'affichage de cette ligne de frais dans la note [après ajout / après clic]
    cy.get('tbody').find('tr').contains('Restaurant').parent().click()
    cy.wait(2000)
    cy.contains('Déjeuner avec le client')

    cy.pause()
  })

  it('Je crée une deuxième ligne de frais pour une mission différente', () => {
    // Vérification de la possibilité de créer une ligne de frais pour le Juin 2022
    cy.get('button').first().should('not.be.disabled')
    // Création d'une ligne de frais
    cy.get('button').first().click()

    // Remplissage des valeurs des champs pour créer une ligne de frais
    cy.get('form').find('[placeholder="Donnez un titre à cette ligne de frais"]').type('Repas')
    cy.get('form').find('[placeholder="Sélectionnez la date"]').click()
    cy.wait(2000)
    cy.get('table').last().find('td').eq(13).click()
    cy.wait(5000)
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
    cy.get('div[role=option]').eq(count-2) // Sélection de l'avant dernière mission dans la liste
      .click()

    cy.get('form').contains('Montant HT').parent().children().should('have.length', 2).last().clear().type('39.50')
    cy.get('form').contains('Montant TVA').parent().children().should('have.length', 2).last().clear().type('3.95')
    const filepath = 'restaurant1.jpeg'
    cy.get('form').find('input[type=file]').attachFile(filepath)
    cy.get('form').find('textarea').type('Dépenses du client')
    cy.pause()
    // Ajout de la ligne
    cy.get('form').find('button').last().click()
    cy.pause()

    // Sélection de la mission de la note
    cy.get('h3').contains('Consultation 3j Client').click()
    cy.wait(2000)
    // Vérification de l'affichage de cette ligne de frais dans la note [après ajout / avant clic]
    cy.get('tbody').find('tr').contains('Repas').parent().children()
      .should('contain', 'Repas')
      .and('contain', '13-02-2022')
      .and('contain', '39.50 €')
      .and('contain', 'Justificatif')
    // Vérification de l'affichage de cette ligne de frais dans la note [après ajout / après clic]
    cy.get('tbody').find('tr').contains('Repas').parent().click()
    cy.wait(2000)
    cy.contains('Dépenses du client')
    
    cy.pause()
  })

  it('M’apercevant que je me suis trompé dans la saisie des informations dans l’une des lignes créées, je décide de modifier cette ligne.', () => {
    // Modification de la ligne
    cy.get('tbody').find('tr').contains('Repas').parent().children().last().find('button').first().click()
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
      .and('contain', '13-02-2022')
      .and('contain', '39.50 €')
      .and('contain', 'Pas de justificatif')
    // Vérification de l'affichage de cette ligne de frais dans la note [après modification / après clic]
    cy.get('tbody').find('tr').contains('Repas professionnel').parent().click()
    cy.contains('Pas de commentaire')

    cy.pause()
  })

  it('Je me rends également compte que l’autre ligne de frais ajoutée est en fait inadéquate. Je décide de la supprimer.', () => {
    // Sélection de la mission de la note
    cy.get('h3').contains('Formation au nouveau logiciel').click()
    cy.wait(2000)
    cy.get('tbody').find('tr').contains('Restaurant').parent().children().last().find('button').last().click()
    cy.pause()
    cy.get('button').last().click()
    cy.pause()
  })

  it('Finalement, je reviens sur ma décision et je restaure cette ligne de frais.', () => {
    cy.get('tbody').find('tr').contains('Restaurant').parent().children().last().find('button').last().click()
    cy.pause()
  })

  it('Je souhaite sauvegarder ma note de frais.', () => {
    // Vérification de la possibilité de sauvegarder la note car au moins une modification a été faite
    cy.get('button').eq(1).should('not.be.disabled')
    // Sauvegarde des modifications sur la note
    cy.get('button').eq(1).click()
    cy.pause()

    // Vérifications avant changement de mois

    // Sélection de la mission "Formation au nouveau logiciel" de la note
    cy.get('h3').contains('Formation au nouveau logiciel').click()
    cy.wait(2000)
    // Vérification de l'affichage de cette ligne de frais dans la note
    cy.get('tbody').find('tr').contains('Restaurant').parent().children()
      .should('contain', 'Restaurant')
      .and('contain', '25-02-2022')
      .and('contain', '38.82 €')
      .and('contain', 'Justificatif')
    cy.get('tbody').find('tr').contains('Restaurant').parent().click()
    cy.wait(2000)
    cy.contains('Déjeuner avec le client')
    cy.pause()

    // Sélection de la mission "Consultation 3j Client" de la note
    cy.get('h3').contains('Consultation 3j Client').click()
    cy.wait(2000)
    // Vérification de l'affichage de cette ligne de frais dans la note
    cy.get('tbody').find('tr').contains('Repas professionnel').parent().children()
      .should('contain', 'Repas professionnel')
      .and('contain', '13-02-2022')
      .and('contain', '39.50 €')
      .and('contain', 'Pas de justificatif')
    cy.get('tbody').find('tr').contains('Repas professionnel').parent().click()
    cy.wait(2000)
    cy.contains('Aucun justificatif n\'a été fournis.')
    cy.contains('Pas de commentaire')

    // Déplacement sur le mois d'aout
    cy.get('label').eq(7).click()
    cy.pause()

    // Déplacement sur le mois de juin
    cy.get('label').eq(5).click()
    cy.pause()

    // Vérifications après changement de mois

    // Sélection de la mission "Formation au nouveau logiciel" de la note
    cy.get('h3').contains('Formation au nouveau logiciel').click()
    cy.wait(2000)
    // Vérification de l'affichage de cette ligne de frais dans la note
    cy.get('tbody').find('tr').contains('Restaurant').parent().children()
      .should('contain', 'Restaurant')
      .and('contain', '25-02-2022')
      .and('contain', '38.82 €')
      .and('contain', 'Justificatif')
    cy.get('tbody').find('tr').contains('Restaurant').parent().click()
    cy.wait(2000)
    cy.contains('Déjeuner avec le client')
    cy.pause()

    // Sélection de la mission "Consultation 3j Client" de la note
    cy.get('h3').contains('Consultation 3j Client').click()
    cy.wait(2000)
    // Vérification de l'affichage de cette ligne de frais dans la note
    cy.get('tbody').find('tr').contains('Repas professionnel').parent().children()
      .should('contain', 'Repas professionnel')
      .and('contain', '13-02-2022')
      .and('contain', '39.50 €')
      .and('contain', 'Pas de justificatif')
    cy.get('tbody').find('tr').contains('Repas professionnel').parent().click()
    cy.wait(2000)
    cy.contains('Aucun justificatif n\'a été fournis.')
    cy.contains('Pas de commentaire')

    cy.pause()
  })

  it('Je décide après quelques réflexions de modifier cette note en supprimant l’une des lignes.', () => {
    // Sélection de la mission de la note
    cy.get('h3').contains('Formation au nouveau logiciel').click()
    cy.wait(2000)
    cy.get('tbody').find('tr').contains('Restaurant').parent().children().last().find('button').last().click()
    cy.pause()
    cy.get('button').last().click()
    cy.pause()
  })

  it('Je clique malencontreusement sur un autre mois de l’année ce qui notifie que je n’ai pas encore sauvegardé mes modifications. Je reviens sur ma décision et me dit que ma modification est vaine. J’annule donc les modifications apportées.', () => {
    // Déplacement sur le mois d'aout
    cy.get('label').eq(7).click()
    cy.pause()
    
    // Supprimer les modifications faites
    cy.get('button').last().click()
    cy.pause()
    // Changement de mois, en juin
    cy.get('label').eq(5).click()
    cy.pause()

    // Sélection de la mission "Formation au nouveau logiciel" de la note
    cy.get('h3').contains('Formation au nouveau logiciel').click()
    cy.wait(2000)
    // Vérification que les informations pour la ligne de frais sont toujours identiques
    cy.get('tbody').find('tr').contains('Restaurant').parent().children()
      .should('contain', 'Restaurant')
      .and('contain', '25-02-2022')
      .and('contain', '38.82 €')
      .and('contain', 'Justificatif')
    cy.get('tbody').find('tr').contains('Restaurant').parent().click()
    cy.wait(2000)
    cy.contains('Déjeuner avec le client')

    cy.pause()
  })

  it('Je soumets la note de frais', () => {
    // Necessite de reset la base a chaque fois !
    cy.get('button').eq(2).click()
    cy.get('button').should('have.length', 0) // changer la valeur en fonction de la note envoyée...
  })

  it('Je supprime une autre note de frais que j’estime désormais inutile', () => {
    
  })

  

})



describe('Tests sur les notes de frais', () => {

  it('Scénario 1 - Impossibilité de modifier/supprimer une note de frais envoyée/validée', () => {
    // Changement d'année, en 2021
    cy.get('input').first().click()
    cy.wait(2000)
    cy.contains('2021').click()
    cy.pause()
    // Changement de mois, en février
    cy.get('label').eq(1).click()
    cy.pause()
    // Vérifications de l'indisponibilité des boutons
    cy.get('button').should('have.length', 6) // les 4 premiers + 1/mission + 3/ligne si modifiables, 1/ligne sinon
    // Changement de mois, en octobre
    cy.get('label').eq(9).click()
    cy.pause()
    // Vérifications de l'indisponibilité des boutons
    cy.get('button').should('have.length', 6)
    cy.pause()
  })


  it('Scénario 3 - Sauvegarder les modifications d\'une note de frais', () => {
    // Puis on va supprimer la ligne que l'on a créée au tout début, en n'oubliant pas de sauvegarder.
    // La ligne devrait disparaître.
    cy.get('tbody').find('tr').contains('Repas professionnel').parent().children().last().find('button').last().click()
    cy.wait(3000)
    cy.get('button').last().click()
    cy.wait(3000)
    cy.get('button').eq(1).click()
    cy.pause()
    // Vérification
    cy.get('button').should('have.length', 4) // les 4 premiers + 1/mission + 3/ligne si modifiables, 1/ligne sinon
    cy.pause()
  })

  it('Scénario 4 - Supprimer la note de frais', () => {
    // Changement de mois, en aout
    cy.get('label').eq(7).click()
    cy.pause()
    // Vérification avant suppression de la note
    cy.get('button').should('have.length', 8)
    // Suppression de la note
    cy.get('h3').contains('Consultation 3j Client').click()
    cy.wait(2000)
    cy.get('button').eq(3).click()
    cy.pause()
    cy.get('button').last().click()
    cy.wait(5000)
    // Reload page
    cy.reload()
    cy.pause()
    // Vérification après suppression de la note
    cy.get('label').eq(7).click()
    cy.get('button').should('have.length', 4)
  })

  
})
