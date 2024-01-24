import './race-car-view.scss';
import { ButtonCreator } from '../../../../../../utils/button-creator/button-creator';
import svg from './car-img';
import flag from '../../../../../../assets/images/flag.svg';
import View from '../../../../view';
import { api } from '../../../../../../api/api';

class RaceCarView extends View {
    private requestId: number;

    private isDriveModeOn: boolean;

    constructor(
        private carName: string,
        private carColor: string,
        private carId: number,
        private removeCar: (arg: number) => void,
        private selectCar: (carName: string, carColor: string, carId: number) => void,
        private defineWinner: (carId: number, carName: string, time: number) => void
    ) {
        const params = {
            tag: 'div',
            classNames: ['race-car-wrapper'],
            parentNode: null,
            textContent: '',
            attributes: { id: `car-race-${carId}` },
        };
        super(params);

        this.carName = carName;
        this.carColor = carColor;
        this.carId = carId;
        this.requestId = 0;
        this.isDriveModeOn = false;
        this.removeCar = removeCar;
        this.selectCar = selectCar;
        this.defineWinner = defineWinner;

        this.configureView();
    }

    private configureView(): void {
        const createHeaderCar = this.createHeaderCarView();
        const createBodyCar = this.createBodyCarView();
        this.viewElementCreator.addInnerElement(createHeaderCar.getHtmlElement() as HTMLElement);
        this.viewElementCreator.addInnerElement(createBodyCar as HTMLElement);
    }

    private createHeaderCarView(): View {
        const headerCarWrapper = new View({
            tag: 'div',
            classNames: ['header-car-wrapper'],
            parentNode: null,
            textContent: '',
            attributes: {},
        });

        const selectButton = this.createSelectButton();
        const removeButton = this.createRemoveButton();

        const carNameWrapper = document.createElement('span');
        carNameWrapper.classList.add('car-name-wrapper');
        carNameWrapper.textContent = this.carName;

        headerCarWrapper.getHtmlElement()?.append(selectButton, removeButton, carNameWrapper);

        return headerCarWrapper;
    }

    private createSelectButton(): HTMLElement {
        const buttonSelect = new ButtonCreator({
            tag: 'button',
            classNames: ['button_action', 'button_select'],
            parentNode: null,
            textContent: 'Select',
            attributes: {},
            callback: () => this.selectCar(this.carName, this.carColor, this.carId),
        });
        return buttonSelect.getElement() as HTMLElement;
    }

    private createRemoveButton(): HTMLElement {
        const buttonRemove = new ButtonCreator({
            tag: 'button',
            classNames: ['button_action', 'button_remove'],
            parentNode: null,
            textContent: 'Remove',
            attributes: null,
            callback: () => this.removeCar(this.carId),
        });
        return buttonRemove.getElement() as HTMLElement;
    }

    private createBodyCarView(): HTMLElement {
        const bodyCarWrapper = document.createElement('div');
        bodyCarWrapper.classList.add('body-car-wrapper');

        const buttonStart = this.createStartEngineButton();
        const buttonStop = this.createStopEngineButton();

        const carImageWrapper = document.createElement('div');
        carImageWrapper.classList.add('car-image-wrapper');
        carImageWrapper.setAttribute('id', `car-${this.carId}`);
        carImageWrapper.innerHTML = svg;
        carImageWrapper.style.fill = this.carColor;

        const raceWrapper = document.createElement('div');
        raceWrapper.classList.add('race-wrapper');
        raceWrapper.append(carImageWrapper, this.createFinishFlagElement());

        bodyCarWrapper.append(buttonStart, buttonStop, raceWrapper);

        return bodyCarWrapper;
    }

    private createFinishFlagElement(): HTMLElement {
        const finishFlag = document.createElement('div');
        finishFlag.classList.add('finish-flag-wrapper');
        const finishFlagImg = document.createElement('img');
        finishFlagImg.classList.add('finish-flag-image');
        finishFlagImg.setAttribute('src', flag);
        finishFlag.append(finishFlagImg);
        return finishFlag;
    }

    private createStartEngineButton(): HTMLElement {
        const buttonA = new ButtonCreator({
            tag: 'button',
            classNames: ['button_start-engine'],
            parentNode: null,
            textContent: 'A',
            attributes: null,
            callback: () => this.startEngine(),
        });
        return buttonA.getElement() as HTMLElement;
    }

    private createStopEngineButton(): HTMLElement {
        const buttonB = new ButtonCreator({
            tag: 'button',
            classNames: ['button_stop-engine', `${this.isDriveModeOn ? '' : 'disabled'}`],
            parentNode: null,
            textContent: 'B',
            attributes: {},
            callback: () => this.stopEngine(),
        });
        return buttonB.getElement() as HTMLElement;
    }

    private async startEngine(): Promise<void> {
        const startEngineResponse = await api.startEngine(this.carId);
        if (!startEngineResponse.ok) return;
        this.setStartEngineButtonVisible(false);
        this.setStopEngineButtonVisible(true);
        const startEngineData = await startEngineResponse.json();
        this.animateCar(startEngineData);
    }

    private async stopEngine(): Promise<void> {
        const stopEngineResponse = await api.stopEngine(this.carId);
        if (!stopEngineResponse.ok) return;
        this.setStartEngineButtonVisible(true);
        this.setStopEngineButtonVisible(false);
        cancelAnimationFrame(this.requestId);
        const carImage = document.getElementById(`car-${this.carId}`);
        if (carImage) carImage.style.transform = 'translateX(0)';
    }

    private async animateCar({ velocity }: { velocity: number }): Promise<void> {
        const carImage = document.getElementById(`car-${this.carId}`);
        if (!carImage) return;

        carImage.style.transform = 'translateX(0)';

        const startTime = new Date().getTime();

        let requestId: number = 0;
        let time = 0;
        let distance = 0;
        const def = (timeRace: number) => this.defineWinner(this.carId, this.carName, timeRace);
        const setRequestId = (id: number) => {
            this.requestId = id;
        };
        function moveCar(): void {
            const currTime = new Date().getTime();
            time = currTime - startTime;
            const speed = velocity / 500;
            distance = speed * time;

            if (carImage) carImage.style.transform = `translateX(${distance}px)`;
            if (distance < window.innerWidth - 150) {
                requestId = window.requestAnimationFrame(moveCar);
                setRequestId(requestId);
            } else {
                def(time);
            }
        }

        window.requestAnimationFrame(moveCar);
        const setDriveModeResponse = await api.drive(this.carId);
        if (setDriveModeResponse.status === 500) {
            cancelAnimationFrame(requestId);
        }
    }

    private setStopEngineButtonVisible(isVisible: boolean): void {
        const buttonB = document.querySelector(`#car-race-${this.carId} .button_stop-engine`);
        if (buttonB) {
            if (isVisible) {
                buttonB.classList.remove('disabled');
                return;
            }
            buttonB.classList.add('disabled');
        }
    }

    private setStartEngineButtonVisible(isVisible: boolean): void {
        const buttonA = document.querySelector(`#car-race-${this.carId} .button_start-engine`);
        if (buttonA) {
            if (isVisible) {
                buttonA.classList.remove('disabled');
                return;
            }
            buttonA.classList.add('disabled');
        }
    }
}

export default RaceCarView;
