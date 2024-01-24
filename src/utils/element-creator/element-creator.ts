interface ElementCreatorProps<T> {
    tag: string;
    classNames: Array<string>;
    parentNode: HTMLElement | null;
    textContent: string;
    attributes: { [key: string]: string } | null;
    callback?: T;
}

class ElementCreator {
    protected element: HTMLElement | null;

    constructor(params: ElementCreatorProps<() => void>) {
        this.element = null;
        this.createElement(params);
    }

    public getElement(): HTMLElement | null {
        return this.element;
    }

    public createElement({
        tag = 'div',
        classNames = [],
        parentNode = null,
        textContent = '',
        attributes = {},
        callback = () => {},
    }: ElementCreatorProps<() => void>): void {
        this.element = document.createElement(tag);
        this.setCssClasses(classNames);
        this.setTextContent(textContent);
        this.setCallback(callback);
        if (parentNode) parentNode.append(this.element);
        if (attributes) {
            Object.entries(attributes).forEach(([prop, value]) => this.element?.setAttribute(prop, value));
        }
    }

    private setCssClasses(cssClasses: Array<string>): void {
        if (!this.element) return;
        if (cssClasses.length !== 0) {
            cssClasses.map((cssClass) => this.element?.classList.add(cssClass));
        }
    }

    public setTextContent(text = ''): void {
        if (!this.element) return;
        this.element.textContent = text;
    }

    public setCallback(callback: (event: MouseEvent) => void): void {
        if (!this.element) return;
        if (typeof callback === 'function') {
            this.element.addEventListener('click', (event) => callback(event));
        }
    }

    public remove(): void {
        if (!this.element) return;
        this.element.remove();
    }

    public appendElementToParent(parentNode: HTMLElement): void {
        if (!this.element) return;
        parentNode.append(this.element);
    }

    addInnerElement(element: HTMLElement | ElementCreator): void {
        if (!this.element) return;
        if (element instanceof ElementCreator) {
            this.element.append(element.getElement() as HTMLElement);
        } else {
            this.element.append(element);
        }
    }
}

export { ElementCreator, ElementCreatorProps };
