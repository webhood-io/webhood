
import {ScanListItem, ScanListItemComponent} from './ScanListItem';
import X from "../public/x.png"
import Image from "next/image"

const testDocumentPending = {
    title: "Test",
    description: "Test",
    url: "https://www.google.com/404",
    created: "2021-01-01T00:00:00.000Z",
    status: "pending",
    id: "1",
    slug: "test",
}

const testDocumentCompleted = {
    ...testDocumentPending,
    status: "done",
    done_at: "2021-01-01T00:01:00.000Z",
    final_url: "https://www.google.com/",
}

describe('ScanListItem', () => {
    beforeEach(() => {
        cy.readFile('public/x.png', null).then((img) => {
            cy.intercept('_next/image*', {
                statusCode: 200,
                headers: { 'Content-Type': 'image/png' },
                body: img.buffer,
            })
            cy.mount(<ScanListItemComponent ImageComponent={
                <Image
                data-cy="scan-image"
                alt={"Placeholder image"}
                src={X}
                placeholder={"blur"}
                width={192 / 2}
                height={108 / 2}
            />
            }
            document={testDocumentPending} />);
        });
    });
    it('link to slug is correct', () => {
        cy.get('[data-cy=slug-link]').should('have.attr', 'href', '/scan/test');
    });
    it('shows correct scan url', () => {
        cy.get('[data-cy=scan-url]').should('have.text', 'www.google.com/404');
    });
    it('shows correct scan status', () => {
        cy.get('[data-cy=scan-status-text]').should('have.text', 'pending');
    });
    it('opens modal when clicking on url', () => {
        cy.get('[data-cy=scan-url]').click();
        cy.get('[data-cy=scan-detailed-table]').should('exist');
    });
    it('shows the pending image', () => {
        cy.get('[data-cy=scan-url]').click();
        cy.get('[data-cy=scan-image]').should('be.visible');
    });
    it('hides modal when clicking on url again', () => {
        cy.get('[data-cy=scan-url]').click();
        cy.get('[data-cy=scan-url]').click();
        cy.get('[data-cy=scan-detailed-table]').should('not.exist');
    });
    it('changes status when document is updated', () => {
        cy.mount(<ScanListItemComponent img={
            <Image
            alt={"Placeholder image"}
            placeholder={"blur"}
            width={192 / 2}
            height={108 / 2}
          />
        }
        document={testDocumentCompleted} />);
        cy.get('[data-cy=scan-status-text]').should('have.text', 'done');
    });
});
