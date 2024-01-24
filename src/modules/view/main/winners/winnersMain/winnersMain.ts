import './winnersMain.scss';

import View from '../../../view';
import WinnersRow from './winnersRow/winners-row';
import State from '../../../../../state/state';

interface WinnersMainType {
    id: number;
    wins: number;
    time: number;
}

class WinnersMain extends View {
    constructor(
        private winnersData: WinnersMainType[],
        private currentPageNumber: string,
        private state: State,
        private sortWinnersByField: (field: string) => void
    ) {
        const params = {
            tag: 'section',
            classNames: ['winners__wrapper'],
            parentNode: null,
            textContent: '',
            attributes: {},
        };
        super(params);

        this.winnersData = winnersData;
        this.state = state;

        this.configureView();
    }

    private configureView(): void {
        const pageTitle = this.renderPageTitle();
        const table = this.renderTable();
        this.viewElementCreator.addInnerElement(pageTitle);
        this.viewElementCreator.addInnerElement(table);
    }

    private renderPageTitle(): HTMLElement {
        const pageNumberTitle = document.createElement('h2');
        pageNumberTitle.classList.add('page-number-title');

        pageNumberTitle.innerText = `Page #${this.currentPageNumber}`;

        return pageNumberTitle;
    }

    private renderTable(): HTMLElement {
        const tableWrapper = document.createElement('table');
        tableWrapper.classList.add('table-wrapper');
        const tableHeader = this.createTableHeader();
        const tableBody = this.createTableBody();
        tableWrapper.append(tableHeader, tableBody);
        return tableWrapper;
    }

    private createTableHeader(): HTMLElement {
        const tableHeader = document.createElement('thead');
        tableHeader.classList.add('table-header');
        const tableHeaderRow = document.createElement('tr');
        tableHeaderRow.classList.add('table-header__row');
        const isSortByWins = this.state.getField('sortBy') === 'wins';
        const isSortByTime = this.state.getField('sortBy') === 'time';
        const sortOrder = this.state.getField('rangeVector') === 'ASC' ? 'sort_asc' : 'sort_desc';
        tableHeaderRow.innerHTML = `
            <td class="table-header__cell table-header__cell_id">Number</td>
            <td class="table-header__cell table-header__cell_car">Car</td>
            <td class="table-header__cell table-header__cell_name">Name</td>
            <td class="table-header__cell table-header__cell_wins ${isSortByWins ? sortOrder : ''}">Wins</td>
            <td class="table-header__cell table-header__cell_time ${
                isSortByTime ? sortOrder : ''
            }">Best time (seconds)</td>
        `;

        tableHeaderRow.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;
            this.headerHandler(target);
        });
        tableHeader.append(tableHeaderRow);
        return tableHeader;
    }

    private createTableBody(): HTMLElement {
        const tableBody = document.createElement('tbody');
        tableBody.classList.add('table-body');

        this.winnersData.forEach((item, index) => {
            const tableRow = new WinnersRow(item, index + 1 + (Number(this.currentPageNumber) - 1) * 10);

            const row = tableRow.getWinnersRowHtml();

            tableBody.append(row);
        });
        return tableBody;
    }

    private headerHandler(target: HTMLElement): void {
        if (target.classList.contains('table-header__cell_wins')) {
            this.sortWinnersByField('wins');
        }
        if (target.classList.contains('table-header__cell_time')) {
            this.sortWinnersByField('time');
        }
    }
}

export default WinnersMain;
