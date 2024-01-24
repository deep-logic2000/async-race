import { ElementCreator } from '../../utils/element-creator/element-creator';

interface IView {
    tag: string;
    classNames: Array<string>;
    parentNode: HTMLElement | null;
    textContent: string;
    attributes: { [key: string]: string };
}

export default class View {
    viewElementCreator: ElementCreator;

    constructor(params = { tag: 'section', classNames: [''], parentNode: null, textContent: '', attributes: {} }) {
        this.viewElementCreator = this.createView(params);
    }

    public getHtmlElement(): HTMLElement | null {
        if (!this.viewElementCreator) return null;
        return this.viewElementCreator.getElement();
    }

    private createView(params: IView): ElementCreator {
        const elementParams = {
            tag: params.tag,
            classNames: params.classNames,
            textContent: '',
            parentNode: null,
            attributes: params.attributes,
        };
        this.viewElementCreator = new ElementCreator(elementParams);

        return this.viewElementCreator;
    }
}
