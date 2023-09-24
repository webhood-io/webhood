import {UrlFormComponent, UrlForm} from './UrlForm';

describe('UrlFormComponent', () => {
    beforeEach(() => {
        cy.mount(
        <UrlFormComponent
            handleSubmit={(e) => {e.preventDefault()}}
            isLoading={false}
            inputError={null}
             />);
    });
    it('can input url', () => {
        cy.get('[data-cy=url-input]').type('www.google.com');
        cy.get('[data-cy=url-input]').should('have.value', 'www.google.com');
    });
    it('can submit url', () => {
        cy.get('[data-cy=url-input]').type('www.google.com');
        cy.get('[data-cy=url-submit]').click();
    });
    it('can submit url to pb', () => {
        cy.intercept('POST', '/api/collections/scans/records', { fixture: "scanresponseitem" }).as('postWebhook');

        cy.mount(
            <UrlForm/>
        )
        cy.get('[data-cy=url-input]').type('www.google.com');
        cy.get('[data-cy=url-submit]').click();
    });
    it('shows error when submitting empty url', () => {
        cy.mount(
            <UrlForm/>
        )
        cy.get('[data-cy=url-submit]').click();
        cy.get('[data-cy=url-input-error]').should('exist');
    });
});
