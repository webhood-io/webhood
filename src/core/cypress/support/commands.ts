// @ts-check
///<reference path="../global.d.ts" />
/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }
// @ts-ignore
Cypress.Commands.add("LoginWithPageSession", (uName: string, pwd: string) => {
  cy.session([uName, pwd], () => {
    cy.visit("http://localhost:3000/")
    // wait for #email for 10 seconds
    cy.get("#email", { timeout: 10000 }).should("be.visible")
    cy.get("#email").type(uName)
    cy.get("#password").type(pwd)
    cy.get("form").submit()
    cy.get("h1", { timeout: 10000 })
      .contains("Start scans")
      .should("be.visible")
  })
})
