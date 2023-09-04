import { render, screen } from "@testing-library/react"

import { ChangePasswordForm } from "../pages/account"
import "@testing-library/jest-dom/extend-expect"

describe("Home", () => {
  it("renders a form with id 'changePassword'", () => {
    render(<ChangePasswordForm />)
    // get by id "changePassword"
    expect(document.getElementById("changePassword")).toBeInTheDocument()
  })
  it("is able to input password", () => {
    render(<ChangePasswordForm />)
    // get by id "changePassword"
    const passwordInput = screen.getByLabelText("Old password")
    expect(passwordInput).toBeInTheDocument()
    // type in password
    passwordInput.value = "password"
    expect(passwordInput.value).toBe("password")
  })
})
