import './race-section-view.scss';
import View from '../../../view';
import RaceCarView from './race-car-view/race-car-view';
import { api, RespCarTypeWithCount } from '../../../../../api/api';
import State from '../../../../../state/state';
import generateCars from '../../../../../utils/generate-cars/generate-cars';
import { ButtonCreator } from '../../../../../utils/button-creator/button-creator';

const CssClasses = {
    RACE__WRAPPER: 'race__wrapper',
};

class RaceSectionView extends View {
    private state: State;

    private isWinnerDefined: boolean;

    constructor(
        private updateGarageTitle: (carsCount: number) => void,
        private setUpdateCarInputValue: (carName: string, carColor: string, carId: number) => void
    ) {
        const params = {
            tag: 'section',
            classNames: [CssClasses.RACE__WRAPPER],
            parentNode: null,
            textContent: '',
            attributes: {},
        };
        super(params);
        this.state = new State();
        this.state.setField('pageNumber', '1');
        this.state.setField('isRaceModeOn', 'false');
        this.isWinnerDefined = false;

        this.configureView();
    }

    public async configureView(): Promise<void> {
        const garageData = await this.getGarageData();
        if (!garageData) return;
        this.state.setField('carsCount', garageData.carsCount);
        this.state.setField('isRaceModeOn', 'false');
        const pageNumberTitle = this.createPageNumberTitle();
        this.viewElementCreator.addInnerElement(pageNumberTitle);

        garageData.data.forEach((car) => {
            const carElement = new RaceCarView(
                car.name,
                car.color,
                car.id,
                this.removeCar.bind(this),
                this.selectCar.bind(this),
                this.defineWinner.bind(this)
            );

            this.viewElementCreator.addInnerElement(carElement.getHtmlElement() as HTMLElement);
        });
        const paginationButtons = this.createPaginationButtons();
        if (this.checkPageIsLast()) {
            paginationButtons.lastElementChild?.classList.add('disabled');
        } else {
            paginationButtons.lastElementChild?.classList.remove('disabled');
        }
        if (this.checkPageIsFirst()) {
            paginationButtons.firstElementChild?.classList.add('disabled');
        } else {
            paginationButtons.firstElementChild?.classList.remove('disabled');
        }
        this.viewElementCreator.addInnerElement(paginationButtons);
        const { carsCount } = garageData;
        this.updateGarageTitle(+carsCount);
        this.setRaceButtonDisabled();
    }

    private async getGarageData(): Promise<RespCarTypeWithCount> {
        const garageData = await api.getCarsByPage(Number(this.state.getField('pageNumber')));
        return garageData;
    }

    private createPageNumberTitle(): HTMLElement {
        const pageNumberTitle = document.createElement('h2');
        pageNumberTitle.classList.add('page-number-title');

        pageNumberTitle.innerText = `Page #${this.state.getField('pageNumber')}`;

        return pageNumberTitle;
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
            classNames: ['button', 'button_prev'],
            attributes: {},
            callback: () => {
                this.changePageNumber(Number(this.state.getField('pageNumber')) - 1);
            },
        };

        const nextButtonParams = {
            ...buttonsCommonParams,
            textContent: 'Next',
            classNames: ['button', 'button_next'],
            attributes: {},
            callback: () => {
                this.changePageNumber(Number(this.state.getField('pageNumber')) + 1);
            },
        };

        const prevButton = new ButtonCreator(prevButtonParams);
        const nextButton = new ButtonCreator(nextButtonParams);

        paginationButtonsWrapper.append(prevButton.getElement() as HTMLElement, nextButton.getElement() as HTMLElement);

        return paginationButtonsWrapper;
    }

    public clearContent(): void {
        const htmlElement = this.viewElementCreator.getElement();
        if (!htmlElement) return;
        while (htmlElement.firstElementChild) {
            htmlElement.firstElementChild.remove();
        }
    }

    private async removeCar(carId: number): Promise<void> {
        try {
            const response = await api.deleteCar(carId);
            if (response.status === 200) {
                this.clearContent();
                this.configureView();
            }
            api.deleteWinner(carId);
        } catch (error) {
            console.log(error);
        }
    }

    private selectCar(carName: string, carColor: string, carId: number): void {
        this.setUpdateCarInputValue(carName, carColor, carId);
    }

    private defineWinner(carId: number, carName: string, time: number): void {
        const isRaceModeOn = this.state.getField('isRaceModeOn') === 'true';
        if (!isRaceModeOn) return;
        if (this.isWinnerDefined) return;
        this.isWinnerDefined = true;
        this.addWinner(carId, time);
        const winnerHTMLElement = this.createWinnerView(carName, time);
        document.body.append(winnerHTMLElement.getHtmlElement() as HTMLElement);
    }

    private createWinnerView(carName: string, time: number): View {
        const winnerView = new View({
            tag: 'div',
            classNames: ['winner-wrapper'],
            parentNode: null,
            textContent: '',
            attributes: {},
        });

        const winnerText = document.createElement('p');
        winnerText.classList.add('winner-text');
        winnerText.textContent = `Winner: ${carName} (${time / 1000}s)`;

        winnerView.getHtmlElement()?.append(winnerText);
        winnerView.getHtmlElement()?.addEventListener('click', () => {
            winnerView.getHtmlElement()?.remove();
        });

        return winnerView;
    }

    public startRace(): void {
        this.state.setField('isRaceModeOn', 'true');
        this.isWinnerDefined = false;
        const startButtons = document.querySelectorAll('.button_start-engine') as NodeListOf<HTMLElement>;

        startButtons.forEach((button) => {
            button.click();
        });
        this.setRaceButtonDisabled();
    }

    public resetRace(): void {
        const resetButtons = document.querySelectorAll('.button_stop-engine') as NodeListOf<HTMLElement>;

        resetButtons.forEach((button) => {
            button.click();
        });
        this.state.setField('isRaceModeOn', 'false');
        this.isWinnerDefined = false;
        this.setRaceButtonDisabled();
    }

    private setRaceButtonDisabled(): void {
        const startRaceButton = document.querySelector('.button_race');
        if (startRaceButton && this.state.getField('isRaceModeOn') === 'true') {
            startRaceButton.setAttribute('disabled', 'true');
        } else {
            startRaceButton?.removeAttribute('disabled');
        }
    }

    public generateCars(): void {
        const newCars = generateCars(100);
        newCars.forEach(async (car) => {
            await api.createCar(car);
        });
        this.clearContent();
        this.configureView();
    }

    private changePageNumber(pageNumber: number): void {
        this.state.setField('pageNumber', String(pageNumber));
        this.clearContent();
        this.configureView();
    }

    private checkPageIsLast(): boolean {
        const pageNumber = Number(this.state.getField('pageNumber'));
        const lastPageNumber = Math.ceil(Number(this.state.getField('carsCount')) / 7);
        if (pageNumber === lastPageNumber) {
            return true;
        }
        return false;
    }

    private checkPageIsFirst(): boolean {
        const pageNumber = Number(this.state.getField('pageNumber'));
        if (pageNumber === 1) {
            return true;
        }
        return false;
    }

    private async addWinner(carId: number, time: number): Promise<void> {
        try {
            const winnerData = await api.getWinner(carId);

            if (!winnerData.id) {
                await api.createWinner({ id: carId, wins: 1, time: time / 1000 });
            } else {
                const updateWinnerBody = {
                    wins: winnerData.wins + 1,
                    time: winnerData.time > time / 1000 ? time / 1000 : winnerData.time,
                };
                await api.updateWinner(carId, updateWinnerBody);
            }
        } catch (error) {
            console.log(error);
        }
    }
}

export default RaceSectionView;
