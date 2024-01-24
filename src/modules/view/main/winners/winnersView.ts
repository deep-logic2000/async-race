import './winners.scss';
import View from '../../view';
import { ElementCreator } from '../../../../utils/element-creator/element-creator';
import State from '../../../../state/state';
import { api } from '../../../../api/api';
import WinnersMain from './winnersMain/winnersMain';
import { ButtonCreator } from '../../../../utils/button-creator/button-creator';

interface WinnersMainType {
    id: number;
    wins: number;
    time: number;
}

const CssClasses = {
    WINNERS: 'winners',
};

class WinnersView extends View {
    private state: State;

    private winnersTable: WinnersMain;

    constructor() {
        const params = {
            tag: 'section',
            classNames: [CssClasses.WINNERS],
            parentNode: null,
            textContent: '',
            attributes: {},
        };
        super(params);
        this.state = new State();
        this.state.setField('currentWinnersPage', '1');
        this.state.setField('sortBy', '');
        this.state.setField('rangeVector', '');
        this.winnersTable = new WinnersMain(
            [],
            this.state.getField('currentWinnersPage') || '1',
            this.state,
            this.sortWinnersByField.bind(this)
        );

        this.configureView();
    }

    private async configureView(): Promise<void> {
        const divParams = {
            tag: 'div',
            classNames: ['winners__wrapper'],
            parentNode: this.viewElementCreator.getElement(),
            textContent: '',
            attributes: {},
        };
        const divElement = new ElementCreator(divParams);
        const winnersData = await this.getWinnersData();
        if (!winnersData) return;
        const winnersTitle = this.createWinnersTitle(winnersData.winnersCount);
        const winnersTable = this.createWinnersTable(winnersData.result);
        const paginationButtons = this.createPaginationButtons();
        this.viewElementCreator.addInnerElement(winnersTitle);
        this.viewElementCreator.addInnerElement(winnersTable.getHtmlElement() as HTMLElement);
        this.viewElementCreator.addInnerElement(divElement.getElement() as HTMLElement);
        this.viewElementCreator.addInnerElement(paginationButtons);
        this.setPaginationButtonsDisabled();
    }

    private async getWinnersData(): Promise<{ winnersCount: string; result: WinnersMainType[] } | undefined> {
        const currentWinnersPage = this.state.getField('currentWinnersPage');
        const sortBy = this.state.getField('sortBy');
        const sortOrder = this.state.getField('rangeVector');
        let winnersData;
        try {
            winnersData = await api.getWinnersByPage(Number(currentWinnersPage), sortBy, sortOrder);
            this.state.setField('winnersCount', winnersData.winnersCount);
        } catch (error) {
            console.log('getGarageData error', error);
        }

        return winnersData;
    }

    private createWinnersTitle(winnersCount: string): HTMLElement {
        const winnersTitle = document.createElement('h1');
        winnersTitle.classList.add('winners-title');
        winnersTitle.textContent = `Winners (${winnersCount})`;
        return winnersTitle;
    }

    private createWinnersTable(winnersData: WinnersMainType[]): WinnersMain {
        this.winnersTable = new WinnersMain(
            winnersData,
            this.state.getField('currentWinnersPage') || '1',
            this.state,
            this.sortWinnersByField.bind(this)
        );

        return this.winnersTable;
    }

    private createPaginationButtons(): HTMLElement {
        const paginationButtonsWrapper = document.createElement('div');
        paginationButtonsWrapper.classList.add('pagination-buttons-wrapper');

        const buttonsCommonParams = {
            tag: 'button',
            parentNode: null,
        };

        const prevButtonParams = {
            ...buttonsCommonParams,
            textContent: 'Prev',
            classNames: ['button', 'button_prev', 'button_winners_prev'],
            attributes: {},
            callback: () => {
                this.changePageNumber(Number(this.state.getField('currentWinnersPage')) - 1);
            },
        };

        const nextButtonParams = {
            ...buttonsCommonParams,
            textContent: 'Next',
            classNames: ['button', 'button_next', 'button_winners_next'],
            attributes: {},
            callback: () => {
                this.changePageNumber(Number(this.state.getField('currentWinnersPage')) + 1);
            },
        };
        const prevButton = new ButtonCreator(prevButtonParams);
        const nextButton = new ButtonCreator(nextButtonParams);

        paginationButtonsWrapper.append(prevButton.getElement() as HTMLElement, nextButton.getElement() as HTMLElement);
        this.setPaginationButtonsDisabled();
        return paginationButtonsWrapper;
    }

    private changePageNumber(pageNumber: number): void {
        console.log('changePageNumber pageNumber', pageNumber);

        if (pageNumber < 1) return;
        this.state.setField('currentWinnersPage', String(pageNumber));
        this.updateWinnersView();
    }

    private async updateWinnersView(): Promise<void> {
        const winnersData = await this.getWinnersData();
        if (!winnersData) return;
        const winnersTabbleElement = document.querySelector('.winners__wrapper');
        if (!winnersTabbleElement) return;
        const winnersTable = this.createWinnersTable(winnersData.result);
        winnersTabbleElement.replaceWith(winnersTable.getHtmlElement() as HTMLElement);
        this.setPaginationButtonsDisabled();
    }

    private setPaginationButtonsDisabled(): void {
        const prevButton = document.querySelector('.button_winners_prev');
        const nextButton = document.querySelector('.button_winners_next');
        if (!prevButton || !nextButton) return;
        const currentPageNumber = Number(this.state.getField('currentWinnersPage'));

        const winnersCount = this.state.getField('winnersCount');

        if (currentPageNumber === 1) {
            prevButton.setAttribute('disabled', 'true');
        } else {
            prevButton.removeAttribute('disabled');
        }
        if (currentPageNumber === Math.ceil(Number(winnersCount) / 10)) {
            nextButton.setAttribute('disabled', 'true');
        } else {
            nextButton.removeAttribute('disabled');
        }
    }

    private async sortWinnersByField(field: string) {
        const currentSortBy = this.state.getField('sortBy');
        const currentRangeVector = this.state.getField('rangeVector');
        if (currentSortBy === field) {
            if (currentRangeVector === 'ASC') {
                this.state.setField('rangeVector', 'DESC');
            } else {
                this.state.setField('rangeVector', 'ASC');
            }
        } else {
            this.state.setField('sortBy', field);
            this.state.setField('rangeVector', 'ASC');
        }
        this.updateWinnersView();
    }
}

export default WinnersView;
