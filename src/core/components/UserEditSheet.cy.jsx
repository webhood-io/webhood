import {UserEditSheet} from "./UserEditSheet"
import {newUser} from "./accountSettings"

const existingUser = {
    id: "1",
    username: "TestUser",
    email: "test@example.com",
    role: "admin"
}

describe("User edit sheet", () => {
    beforeEach(() => {
        cy.mount(<UserEditSheet user={newUser}><button data-cy="trigger-button">click</button></UserEditSheet>);
        cy.get("[data-cy=trigger-button]").click();
    });
    it("submits correct form data", () => {
        cy.intercept("POST", "/api/collections/users/records", (req) => {
            expect(req.body).to.deep.equal({
                username: "TestUser",
                email: "test@example.com",
                password: "password",
                passwordConfirm: "password",
                role: "admin"
            });
            req.reply({body: {user: newUser}});
        });
        cy.get("input[name=username]").type("TestUser");
        cy.get("input[name=email]").type("test@example.com");
        cy.get("input[name=password]").type("password");
        cy.get("input[name=passwordConfirm]").type("password");
        cy.get("select[name=role]").select("admin", {force: true});
        cy.get("[data-cy=submit-button]").click();
    });
    it("shows error message when username is too short", () => {
        cy.get("input[name=username]").type("a");
        cy.get("input[name=email]").type("test.example.com");
        cy.get("input[name=password]").type("password");
        cy.get("input[name=passwordConfirm]").type("passwordwrong");
        cy.get("select[name=role]").select("admin", {force: true});
        cy.get("[data-cy=submit-button]").click();
        cy.get("input[name=username]").parent().get("p").should("contain", "String must contain at least 3 character(s)")
        cy.get("input[name=email]").parent().get("p").should("contain", "Invalid email")
        cy.get("input[name=passwordConfirm]").parent().get("p").should("contain", "Passwords don't match")
    });
    /*
    it("does not show password confirm input when user is being edited", () => {
        cy.mount(<UserEditSheet user={existingUser}><button data-cy="trigger-button">click</button></UserEditSheet>);
        cy.get("[data-cy=trigger-button]").click();
        cy.get("input[name=passwordConfirm]").should("not.exist");
    });
    */
    it("does not submit password when password is not changed", () => {
        cy.intercept("PATCH", "/api/collections/users/records/1", (req) => {
            expect(req.body).to.deep.equal({
                username: "TestUser",
                email: "test@example.com",
                role: "user",
            });
            req.reply({body: {user: existingUser}});
        });
        cy.mount(<UserEditSheet user={existingUser}><button data-cy="trigger-button">click</button></UserEditSheet>);
        cy.get("[data-cy=trigger-button]").click();
        cy.get("select[name=role]").select("user", {force: true});
        cy.get("[data-cy=submit-button]").click();
    });
    it("submits correct form data when editing existing user with password change", () => {
        cy.intercept("PATCH", "/api/collections/users/records/1", (req) => {
            expect(req.body).to.deep.equal({
                username: "TestUser",
                email: "test@example.com",
                role: "user",
                password: "password",
                passwordConfirm: "password",
            });
            req.reply({body: {user: existingUser}});
        });
        cy.mount(<UserEditSheet user={existingUser}><button data-cy="trigger-button">click</button></UserEditSheet>);
        cy.get("[data-cy=trigger-button]").click();
        cy.get("select[name=role]").select("user", {force: true});
        cy.get("input[name=password]").type("password");
        cy.get("input[name=passwordConfirm]").type("password");
        cy.get("[data-cy=submit-button]").click();
    });
});

