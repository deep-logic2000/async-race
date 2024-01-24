interface ButtonCreatorProps<T> {
    tag: string;
    classNames: Array<string>;
    parentNode: HTMLElement | null;
    textContent: string;
    attributes: { [key: string]: string } | null;
    callback?: T;
}

class ButtonCreator {
    protected button: HTMLElement | null;

    constructor(params: ButtonCreatorProps<() => void>) {
        this.button = null;
        this.createElement(params);
    }

    public getElement(): HTMLElement | null {
        return this.button;
    }

    public createElement({
        tag = 'button',
        classNames = ['button'],
        parentNode = null,
        textContent = 'BUTTON',
        attributes = null,
        callback = () => {},
    }: ButtonCreatorProps<() => void>): void {
        this.button = document.createElement(tag);
        this.setCssClasses(classNames);
        this.setTextContent(textContent);
        this.setCallback(callback);
        if (parentNode) parentNode.append(this.button);
        if (attributes) this.setAttributes(attributes);
    }

    private setCssClasses(cssClasses: Array<string>): void {
        if (!this.button) return;
        if (cssClasses.length !== 0) {
            cssClasses.map((cssClass) => this.button?.classList.add(cssClass));
        }
    }

    public setTextContent(text = ''): void {
        if (!this.button) return;
        this.button.textContent = text;
    }

    public setCallback(callback: (event: MouseEvent) => void): void {
        if (!this.button) return;
        if (typeof callback === 'function') {
            this.button.addEventListener('click', (event) => callback(event));
        }
    }

    public remove(): void {
        if (!this.button) return;
        this.button.remove();
    }

    public appendElementToParent(parentNode: HTMLElement): void {
        if (!this.button) return;
        parentNode.append(this.button);
    }

    public addInnerElement(button: HTMLElement | ButtonCreator): void {
        if (!this.button) return;
        if (button instanceof ButtonCreator) {
            this.button.append(button.getElement() as HTMLElement);
        } else {
            this.button.append(button);
        }
    }

    public setAttributes(attributes: { [key: string]: string }): void {
        if (!this.button) return;
        if (!Object.entries(attributes).length) return;
        Object.entries(attributes).forEach(([prop, value]) => this.button?.setAttribute(prop, value));
    }
}

export { ButtonCreator, ButtonCreatorProps };
