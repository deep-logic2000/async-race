interface ElementCreatorProps {
    tag: string;
    classNames: Array<string>;
    parentNode: HTMLElement | null;
    attributes: { [key: string]: string } | null;
    callback?: (event: KeyboardEvent) => void;
}

const InputFieldCssClasses = {
    CONTAINER: 'input__container',
    INPUT_TEXT: 'input__text',
};

class InputTextFieldCreator {
    private inputElement: HTMLInputElement | null;

    private inputElementWrapper: HTMLElement | null;

    constructor(params: ElementCreatorProps) {
        this.inputElement = document.createElement('input');
        this.inputElementWrapper = null;
        this.createElement(params);
    }

    public getElement(): HTMLElement | null {
        return this.inputElementWrapper;
    }

    public createElement({
        classNames = [],
        parentNode = null,
        attributes = null,
        callback = () => {},
    }: ElementCreatorProps): void {
        this.inputElementWrapper = document.createElement('div');
        this.inputElementWrapper.classList.add(InputFieldCssClasses.CONTAINER);

        if (this.inputElement) this.inputElement.classList.add(InputFieldCssClasses.INPUT_TEXT);

        this.setCssClasses(classNames);
        this.setCallback(callback);

        if (attributes) {
            Object.entries(attributes).forEach(([prop, value]) => this.inputElement?.setAttribute(prop, value));
        }

        if (this.inputElement) this.inputElementWrapper.append(this.inputElement);

        if (parentNode) parentNode.append(this.inputElementWrapper);
    }

    private setCssClasses(cssClasses: Array<string>): void {
        if (!this.inputElement) return;
        if (cssClasses.length !== 0) {
            cssClasses.forEach((cssClass) => this.inputElement?.classList.add(cssClass));
        }
    }

    public setCallback(callback: (event: KeyboardEvent) => void): void {
        if (!this.inputElement) return;
        if (typeof callback === 'function') {
            this.inputElement.addEventListener('keyup', (event) => callback(event));
        }
    }

    setValue(value: string) {
        if (this.inputElement) this.inputElement.value = value;
    }

    public remove(): void {
        if (!this.inputElement) return;
        this.inputElement.remove();
    }

    public appendElementToParent(parentNode: HTMLElement): void {
        if (!this.inputElement) return;
        parentNode.append(this.inputElement);
    }
}

export default InputTextFieldCreator;
