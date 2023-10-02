describe('get scans', () => {
  beforeEach(() => {
    cy.request({
            'url': '/api/beta/scans/',
            'headers': {
              'Authorization': `Token ${Cypress.env('SCANNER_TOKEN')}`
            }
          }).as('scanRequest');
    cy.request({
            'url': '/api/beta/scans/',
            failOnStatusCode: false
          }).as('unAuthscanRequest');
  });
    it('posts new scan - POST', () => {
        cy.request({
          'method': 'POST',
          'url': '/api/beta/scans',
          'headers': {
            'Authorization': `Token ${Cypress.env('SCANNER_TOKEN')}`
          },
          'body': {
            'url': 'https://www.google.com',
          }
        }).as('scanPost');
        cy.get('@scanPost').then(scans => {
            expect(scans.status).to.eq(201);
            expect(scans.body).to.have.property('status', 'pending');
            expect(scans.body).to.have.property('url', 'https://www.google.com');
        });
      });
    it('fetches scan items - GET', () => {
        cy.get('@scanRequest').then(scans => {
          console.log(scans.body)
            expect(scans.status).to.eq(200);
            // expect todoItem[0] to have property 'completed' equal to false
            expect(scans.body[0]).to.have.property('id');
            expect(scans.body[0]).to.have.property('status', 'pending');
            expect(scans.body[0]).to.have.property('url', 'https://www.google.com');
        });
    });
    it('fails when request is not authorized', () => {
      cy.get('@unAuthscanRequest').then(scans => {
          expect(scans.status).to.eq(401);
      });
    });
 });