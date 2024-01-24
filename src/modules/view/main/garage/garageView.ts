import './garage.scss';
import View from '../../view';
import InputTextFieldCreator from '../../../../utils/input-creator/input-text-field-creator/input-text-field-creator';
import InputColorFieldCreator from '../../../../utils/input-creator/input-color-field-creator/input-color-field-creator';
import { api, RespCarTypeWithCount } from '../../../../api/api';
import RaceSectionView from './raceSection/race-section-view';
import State from '../../../../state/state';
import { ButtonCreator } from '../../../../utils/button-creator/button-creator';

const CssClasses = {
    GARAGE: 'garage',
};

class GarageView extends View {
    private createCarInput: string;

    private createCarInputColor: string;

    private updateCarInput: string;

    private updateCarInputColor: string;

    private raceSection: RaceSectionView;

    private pageNumber: number;

    private state: State;

    constructor() {
        const params = {
            tag: 'section',
            classNames: [CssClasses.GARAGE],
            parentNode: null,
            textContent: 'Garage section',
            attributes: {},
        };
        super(params);

        this.createCarInput = '';
        this.createCarInputColor = '';
        this.updateCarInput = '';
        this.updateCarInputColor = '';
        this.raceSection = new RaceSectionView(
            this.updateGarageTitle.bind(this),
            this.setUpdateCarInputValue.bind(this)
        );
        this.pageNumber = 1;
        this.state = new State();

        this.configureView();
    }

    private async configureView(): Promise<void> {
        const garageData = await this.getGarageData();
        if (!garageData) return;
        const garageTitle = this.createGarageTitle(garageData.carsCount);
        this.state.setField('carsCount', garageData.carsCount);
        const creatorCreateInput = this.buildCarInputForms('create');
        creatorCreateInput.classList.add('create-input-wrapper');
        const creatorUpdateInput = this.buildCarInputForms('update');
        creatorUpdateInput.classList.add('update-input-wrapper');
        const createButtonsGroup = this.createButtonsGroup();
        this.viewElementCreator.addInnerElement(creatorCreateInput);
        this.viewElementCreator.addInnerElement(creatorUpdateInput);
        this.viewElementCreator.addInnerElement(createButtonsGroup);
        this.viewElementCreator.addInnerElement(garageTitle);
        this.viewElementCreator.addInnerElement(this.raceSection.getHtmlElement() as HTMLElement);
    }

    private async getGarageData(): Promise<RespCarTypeWithCount | undefined> {
        let garageData;
        try {
            garageData = await api.getCarsByPage(this.pageNumber);
        } catch (error) {
            console.log('getGarageData error', error);
        }
        return garageData;
    }

    private createGarageTitle(carsCount: string): HTMLElement {
        const garageTitle = document.createElement('h1');
        garageTitle.classList.add('garage-title');
        garageTitle.textContent = `Garage (${carsCount})`;
        return garageTitle;
    }

    private buildCarInputForms(type: string): HTMLElement {
        const inputWrapper = document.createElement('div');
        const creatorTextInput = this.createTextInput(type);
        const creatorColorInput = this.createColorInput(type);

        const createButton = this.createButtonHandler(type, () =>
            type === 'create' ? this.createCarFn() : this.updateCarFn()
        );

        inputWrapper.append(creatorTextInput, creatorColorInput, createButton);

        return inputWrapper;
    }

    private createButtonsGroup(): HTMLElement {
        const buttonsGroup = document.createElement('div');
        buttonsGroup.classList.add('buttons-group');
        const buttonCommonParams = {
            tag: 'button',
            parentNode: null,
            attributes: {},
        };
        const raceButton = new ButtonCreator({
            ...buttonCommonParams,
            textContent: 'Race',
            classNames: ['button', 'button_race'],
            callback: () => this.startRace(),
        });
        const resetButton = new ButtonCreator({
            ...buttonCommonParams,
            textContent: 'Reset',
            classNames: ['button', 'button_reset'],
            callback: () => this.resetRace(),
        });
        const generateCarsButton = new ButtonCreator({
            ...buttonCommonParams,
            textContent: 'Generate cars',
            classNames: ['button', 'button_generate-cars'],
            callback: () => this.generateCars(),
        });
        buttonsGroup.append(
            raceButton.getElement() as HTMLElement,
            resetButton.getElement() as HTMLElement,
            generateCarsButton.getElement() as HTMLElement
        );
        return buttonsGroup;
    }

    private async createCarFn(): Promise<void> {
        const createCarParams = {
            name: this.createCarInput,
            color: this.createCarInputColor,
        };

        const response = await api.createCar(createCarParams);
        if (!response.ok) return;
        this.clearInputField('create');
        this.raceSection.clearContent();
        this.raceSection.configureView();
        this.updateGarageTitle(Number(this.state.getField('carsCount')) + 1);
        const nextButton = document.querySelector('.button_next');
        if (!nextButton) return;
        const carsCount = Number(this.state.getField('carsCount'));
        const pagesCount = Math.ceil(carsCount / 7);
        if (carsCount >= 7 && this.pageNumber < pagesCount) {
            nextButton.setAttribute('disabled', 'false');
        } else {
            nextButton.setAttribute('disabled', 'true');
        }
    }

    private async updateCarFn(): Promise<void> {
        const updateCarParams = {
            name: this.updateCarInput,
            color: this.updateCarInputColor,
        };
        if (!this.updateCarInput && !this.updateCarInputColor) return;
        const response = await api.updateCar(Number(this.state.getField('currentCarId')), updateCarParams);

        if (!response.ok) return;
        this.raceSection.clearContent();
        this.raceSection.configureView();
        this.clearInputField('update');
    }

    private createTextInput(type: string): HTMLInputElement {
        const inputTextParams = {
            tag: 'input',
            classNames: [],
            parentNode: this.viewElementCreator.getElement(),
            attributes: { type: 'text' },
            callback: (event: KeyboardEvent) =>
                this.keyupHandler(event, type === 'create' ? 'createCarInput' : 'updateCarInput'),
        };
        const textInput = new InputTextFieldCreator(inputTextParams).getElement() as HTMLInputElement;
        return textInput;
    }

    private createColorInput(type: string): HTMLInputElement {
        const inputColorParams = {
            tag: 'input',
            classNames: [],
            parentNode: this.viewElementCreator.getElement(),
            attributes: { type: 'color' },
            callback: (event: Event) =>
                this.setColorHandler(event, type === 'create' ? 'createCarInputColor' : 'updateCarInputColor'),
        };

        const colorInput = new InputColorFieldCreator(inputColorParams).getElement() as HTMLInputElement;
        return colorInput;
    }

    private keyupHandler(event: KeyboardEvent, name: string): void {
        if (!(event.target instanceof HTMLInputElement)) return;
        if (name === 'createCarInput') {
            this.createCarInput = event.target.value;
        }

        if (name === 'updateCarInput') {
            this.updateCarInput = event.target.value;
        }
    }

    private setColorHandler(event: Event, name: string): void {
        if (!(event.target instanceof HTMLInputElement)) return;
        if (name === 'createCarInputColor') {
            this.createCarInputColor = event.target.value;
        }

        if (name === 'updateCarInputColor') {
            this.updateCarInputColor = event.target.value;
        }
    }

    private createButtonHandler(type: string, callback: () => void): HTMLButtonElement {
        const createButton = document.createElement('button');
        createButton.classList.add(`button_${type}`);
        createButton.textContent = type;
        createButton.addEventListener('click', callback);
        return createButton;
    }

    private updateGarageTitle(carsCount: number): void {
        const garageTitle = document.querySelector('.garage-title');
        if (!garageTitle) return;
        garageTitle.textContent = `Garage (${carsCount})`;
    }

    private setUpdateCarInputValue(carName: string, carColor: string, carId: number): void {
        const updateCarInput = document.querySelector('.update-input-wrapper input[type="text"]');
        const updateCarInputColor = document.querySelector('.update-input-wrapper input[type="color"]');

        if (!updateCarInput || !updateCarInputColor) return;
        (updateCarInput as HTMLInputElement).value = carName;
        this.updateCarInput = carName;
        (updateCarInputColor as HTMLInputElement).value = carColor;
        this.updateCarInputColor = carColor;
        this.state.setField('currentCarId', `${carId}`);
    }

    private startRace(): void {
        this.raceSection.startRace();
    }

    private resetRace(): void {
        this.raceSection.resetRace();
    }

    private generateCars(): void {
        this.raceSection.generateCars();
    }

    private clearInputField(type: string): void {
        const inputText = document.querySelector(`.${type}-input-wrapper input[type="text"]`);

        if (!inputText) return;
        (inputText as HTMLInputElement).value = '';
        if (type === 'create') {
            this.createCarInput = '';
        } else {
            this.updateCarInput = '';
        }
    }
}

export default GarageView;
