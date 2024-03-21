import Image from "next/image";
import X from "../public/x.png";
import { ScanListItem, ScanListItemComponent } from './ScanListItem';

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
    screenshots: ["ss.png"]
}

const testDocumentErrored = {
    ...testDocumentPending,
    status: "error",
    done_at: "2021-01-01T00:01:00.000Z",
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
    it('shows the pending image', () => {
        cy.mount(<ScanListItem document={testDocumentPending} token='123' />);
        cy.get('[data-cy=scan-url]').click();
        cy.get('[data-cy=image-div]').children().first().should('have.attr', 'alt', 'Placeholder image');
    });
    /* Enable this once we can stub internal function
    it('shows the completed image', () => {
        cy.mount(<ScanListItem document={testDocumentCompleted}/>);
        // alt text is "Screenshot of the scan"
        pb.files.getUrl = cy.stub().returns('https://picsum.photos/96/54'); // todo: use a real image, this will not work due to intercept in beforeEach
        cy.stub(UseFile, "useToken").returns("")
        cy.get('[data-cy=scan-url]').click();
        cy.get('[data-cy=image-div]').children().first().should('have.attr', 'alt', 'Screenshot of the scan');
    });
    */
    it('shows error image when scan errors', () => {
        // alt text is "Error image"
        cy.mount(<ScanListItem document={testDocumentErrored} token='123'/>);
        cy.get('[data-cy=scan-url]').click();
        cy.get('[data-cy=image-div]').children().first().should('have.attr', 'alt', 'Error image');
    });
});
