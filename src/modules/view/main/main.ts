import './main.scss';
import View from '../view';

const CssClasses = {
    MAIN: 'main',
};

class MainView extends View {
    constructor() {
        const params = {
            tag: 'main',
            classNames: [CssClasses.MAIN],
            parentNode: null,
            textContent: '',
            attributes: {},
        };
        super(params);
    }

    public setContent(content: View): void {
        const htmlElement = this.viewElementCreator.getElement();
        if (!htmlElement) return;
        while (htmlElement.firstElementChild) {
            htmlElement.firstElementChild.remove();
        }
        this.viewElementCreator.addInnerElement(content.getHtmlElement() as HTMLElement);
    }
}

export default MainView;
