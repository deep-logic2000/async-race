import './linkButton.scss';
import View from '../../view';

interface PageParamType {
    name: string;
    callback: () => void;
}

const CssClasses = {
    BUTTON: 'button_link',
    BUTTON__GARAGE: 'button__garage',
    BUTTON__WINNERS: 'button__winners',
    BUTTON__SELECTED: 'button__selected',
};

export default class LinkButtonView extends View {
    linkButtonElements: Array<LinkButtonView>;

    constructor(pageParam: PageParamType, linkElements: Array<LinkButtonView>) {
        const params = {
            tag: 'a',
            classNames: [CssClasses.BUTTON],
            parentNode: null,
            textContent: '',
            attributes: {},
        };
        super(params);

        this.linkButtonElements = linkElements;

        this.configureView(pageParam);
    }

    public setSelectedStatus(): void {
        this.linkButtonElements.forEach((linkElement: LinkButtonView): void => linkElement.setNotSelectedStatus());

        const element = this.viewElementCreator.getElement();
        if (!element) return;
        element.classList.add(CssClasses.BUTTON__SELECTED);
    }

    private setNotSelectedStatus(): void {
        const element = this.viewElementCreator.getElement();
        if (!element) return;
        element.classList.remove(CssClasses.BUTTON__SELECTED);
    }

    private configureView(pageParam: PageParamType): void {
        this.viewElementCreator.setTextContent(pageParam.name);
        this.viewElementCreator.setCallback(pageParam.callback);

        const element = this.viewElementCreator.getElement();
        if (!element) return;
        element.addEventListener('click', this.setSelectedStatus.bind(this));
    }
}
