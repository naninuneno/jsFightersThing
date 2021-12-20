describe('The Home Page', () => {
  it('successfully loads', () => {
    cy.intercept('GET', 'http://127.0.0.1:3000/fights', {fixture: 'fights.json'});
    cy.intercept('GET', 'http://127.0.0.1:3000/fighters?start=0&count=10&filter=', {fixture: 'fighters.json'});
    cy.intercept('GET', 'http://127.0.0.1:3000/events', {fixture: 'events.json'});

    cy.visit('/');
    cy.get('mat-panel-title').contains('Fighters').click();

    cy.xpath('//app-fighter-list//li[contains(@class, "expandable-container")][1]')
      .should('contain', 'Jose Aldo')
    cy.xpath('//app-fighter-list//li[contains(@class, "expandable-container")][2]')
      .should('contain', 'Nick Diaz')
  })
})
