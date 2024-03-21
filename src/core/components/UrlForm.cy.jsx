import { UrlForm } from './UrlForm';

describe('UrlFormComponent', () => {
    beforeEach(() => {
        cy.intercept('/api/collections/scanners/records*', { fixture: 'scannersresponse.json' })
        cy.mount(<UrlForm/>);
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
        cy.get('[data-cy=url-input]').type('www.google.com');
        cy.intercept('POST', '/api/collections/scans/records', { fixture: "scanresponseitem" }).as('postWebhook');
        cy.get('[data-cy=url-submit]').click();
    });
    it('shows error when submitting empty url', () => {
        cy.mount(
            <UrlForm/>
        )
        cy.get('[data-cy=url-submit]').click();
        cy.get('[data-cy=url-input-error]').should('exist');
    });
    it('shows scanner selector', () => {
        cy.get('[data-cy=options-open]').click();
        cy.get("select[name='options.scannerId']").select("scanner2", {force: true});
    });
});