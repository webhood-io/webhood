describe('get scans', () => {
  beforeEach(() => {
    cy.request({
            'url': 'localhost:8090/api/beta/scans/',
            'headers': {
              'Authorization': `Token ${Cypress.env('SCANNER_TOKEN')}`
            }
          }).as('scanRequest');
    cy.request({
            'url': 'localhost:8090/api/beta/scans/',
            failOnStatusCode: false
          }).as('unAuthscanRequest');
  });
    it('posts new scan - POST', () => {
        cy.request({
          'method': 'POST',
          'url': 'localhost:8090/api/beta/scans',
          'headers': {
            'Authorization': `Token ${Cypress.env('SCANNER_TOKEN')}`
          },
          'body': {
            'url': 'https://www.google.com',
          }
        }).as('scanPost');
        cy.get('@scanPost').then(scans => {
            expect(scans.status).to.eq(202);
            expect(scans.body).to.have.property('status', 'pending');
            // expect location header to /api/beta/scans/{id}
            expect(scans.headers).to.have.property('Location', `/api/beta/scans/${scans.body.id}`);
            expect(scans.body).to.have.property('url', 'https://www.google.com');
        });
      });
    it('fetches scan items - GET', () => {
        cy.get('@scanRequest').then(scans => {
          console.log(scans.body)
          // status is 202 - accepted, when scan is in progress
            expect(scans.status).to.eq(202);
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