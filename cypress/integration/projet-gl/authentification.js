describe('Connexion', () => {
  
  it('Identifiants incorrects', () => {
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
    cy.get('input[name=email]').type('random.user@pops2122.fr')
    cy.get('input[name=password]').type('Random')
    cy.contains('Se connecter').click()
    cy.wait(2000)
    // Vérification que la connexion a échoué puisque les valeurs sont fausses
    cy.url().should('eq', 'http://localhost:3000/auth/signin?callbackUrl=http://localhost:3000/&error=CredentialsSignin')    
    
    // Insertion des valeurs des champs de connexion pour se connecter
    cy.get('input[name=email]').type('remy.thieffry@pops2122.fr')
    cy.get('input[name=password]').type('remy')
    cy.contains('Se connecter').click()
    cy.wait(2000)
    // Vérification que la connexion a échoué puisque les valeurs sont fausses
    cy.url().should('eq', 'http://localhost:3000/auth/signin?callbackUrl=http://localhost:3000/&error=CredentialsSignin')    
    
    // Insertion des valeurs des champs de connexion pour se connecter
    cy.get('input[name=email]').type('remy.thieffry@pops2122.fr')
    cy.get('input[name=password]').type('Remy')
    cy.contains('Se connecter').click()
    cy.wait(2000)
    // Vérification que la connexion a échoué puisque les valeurs sont fausses
    cy.url().should('eq', 'http://localhost:3000/auth/signin?callbackUrl=http://localhost:3000/&error=CredentialsSignin')    
    
    // Insertion des valeurs des champs de connexion pour se connecter
    cy.get('input[name=email]').type('remy.thieffry@pops2122.fr')
    cy.get('input[name=password]').type('Rméy')
    cy.contains('Se connecter').click()
    cy.wait(2000)
    // Vérification que la connexion a échoué puisque les valeurs sont fausses
    cy.url().should('eq', 'http://localhost:3000/auth/signin?callbackUrl=http://localhost:3000/&error=CredentialsSignin')    
    
    // Insertion des valeurs des champs de connexion pour se connecter
    cy.get('input[name=email]').type('remy.thieffry@pops2122.fr')
    cy.get('input[name=password]').type('Thieffry')
    cy.contains('Se connecter').click()
    cy.wait(2000)
    // Vérification que la connexion a échoué puisque les valeurs sont fausses
    cy.url().should('eq', 'http://localhost:3000/auth/signin?callbackUrl=http://localhost:3000/&error=CredentialsSignin')    
  })


  it('Identifiants corrects', () => {
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
    cy.get('input[name=email]').type('antonin.depreissat@pops2122.fr')
    cy.get('input[name=password]').type('Antonin')
    cy.contains('Se connecter').click()
    cy.wait(5000)
    // Vérification que la connexion a réussie
    cy.url().should('eq', 'http://localhost:3000/home/2022')
  })


  it('Deconnexion', () => {
    // Deconnexion
    cy.get('button').eq(0).click()
    cy.contains('button', 'Deconnexion').click()
    // Vérification de l'url
    cy.url().should('eq', 'http://localhost:3000/')
    // Vérification de redirection
    cy.reload()
    cy.url().should('eq', 'http://localhost:3000/')
    // Vérification de redirection
    cy.visit('http://localhost:3000/home/2022')
    cy.url().should('eq', 'http://localhost:3000/')
    // Vérification de la suppression des cookies après déconnexion, en accedant à la page de connexion
    cy.contains('Se connecter').click()
    cy.wait(5000)
    cy.url().should('eq', 'http://localhost:3000/auth/signin?callbackUrl=http://localhost:3000/')
  })

})
