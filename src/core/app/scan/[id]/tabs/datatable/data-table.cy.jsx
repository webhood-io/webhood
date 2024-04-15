import { columns } from "./columns"
import { DataTable } from "./data-table"

const data = [
  {
    key: "key",
    value: "stringvalue",
  },
  {
    key: "key",
    value: ["arrayvalue1", "arrayvalue2"],
  },
  {
    key: "key",
    value: 123,
  },
  {
    key: "key",
    value: {
      key: "nestedobjectvalue",
      anotherkey: ["nestedarrayvalue1", "nestedarrayvalue2"],
    },
  },
]

describe("Datatable", () => {
  it("renders", () => {
    cy.mount(<DataTable data={data} columns={columns} />)
  })
})
