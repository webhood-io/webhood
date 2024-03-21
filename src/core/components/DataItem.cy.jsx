import { DataItem } from './DataItem';

describe('DataItem', () => {
    beforeEach(() => {
        cy.mount(
            <DataItem
                label='test-label'
                content='test-content'
                copy={true}
             />
        );
    });
    it('renders', () => {
        cy.get('[data-cy=dataitem-wrapper]').should('exist');
    });
    it("copies content to clipboard", () => {
        cy.get('[data-cy=dataitem-wrapper]').click();
        cy.get('[data-cy=dataitem-copymessage]').should('exist');
    });
    it("does not show copy message when copy is false", () => {
        cy.mount(
            <DataItem
                label='test'
                content='test'
                copy={false}
             />
        );
        cy.get('[data-cy=dataitem-wrapper]').click();
        cy.get('[data-cy=dataitem-copymessage]').should('not.exist');
    });
    it("clipboard contains content", () => {
        cy.get('[data-cy=dataitem-wrapper]').realClick(); // real world click required for clipboard
        cy.window().then((win) => {
            win.navigator.clipboard.readText().then((text) => {
              expect(text).to.eq('test-content');
            });
        });
    });
    it("does not show copy message after 2 second", () => {
        cy.get('[data-cy=dataitem-wrapper]').click();
        cy.wait(2000);
        cy.get('[data-cy=dataitem-copymessage]').should('not.exist');
    });

});