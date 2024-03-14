import {StatusMessage, StatusMessageUncontrolled} from "./statusMessage"

describe("StatusMessage", () => {
    it("shows error message", () => {
        cy.mount(<StatusMessage statusMessage={{
            status: "error",
            message: "Error test",
        }} />);
        cy.get('[data-cy=status-message]').should('have.text', 'Error test');
    });
    it("shows generic error message", () => {
        cy.mount(<StatusMessage statusMessage={{
            status: "error",
        }} />);
        cy.get('[data-cy=status-message]').should('have.text', 'Error');
    });
    it("shows success message", () => {
        cy.mount(<StatusMessage statusMessage={{
            status: "success",
            message: "Success test",
        }} />);
        cy.get('[data-cy=status-message]').should('have.text', 'Success test');
    });
    it("shows generic success message", () => {
        cy.mount(<StatusMessage statusMessage={{
            status: "success",
        }} />);
        cy.get('[data-cy=status-message]').should('have.text', 'Success');
    });
    it("disappears after 2 seconds", () => {
        cy.mount(<StatusMessageUncontrolled statusMessage={{
            status: "success",
            message: "Success test",
        }} />);
        cy.wait(2000);
        cy.get('[data-cy=status-message]').should('not.exist');
    });
});