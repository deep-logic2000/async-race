import './header.scss';
import View from '../view';
import { ElementCreator } from '../../../utils/element-creator/element-creator';
import MainView from '../main/main';
import GarageView from '../main/garage/garageView';
import WinnersView from '../main/winners/winnersView';
import LinkButtonView from './linkButton/linkButton';

const CssClasses = {
    HEADER: 'header',
    BUTTONS: 'header__buttons',
};

const NamePages = {
    GARAGE: 'Garage',
    WINNERS: 'Winners',
};

const START_PAGE_INDEX = 0;

class HeaderView extends View {
    headerLinkElements: Array<LinkButtonView>;

    constructor(mainComponent: MainView) {
        const params = {
            tag: 'header',
            classNames: [CssClasses.HEADER],
            parentNode: null,
            textContent: '',
            attributes: {},
        };
        super(params);
        this.headerLinkElements = [];
        this.configureHeader(mainComponent);
    }

    private configureHeader(mainComponent: MainView): void {
        const buttonsWrapperParams = {
            tag: 'div',
            classNames: [CssClasses.BUTTONS],
            parentNode: this.viewElementCreator.getElement(),
            textContent: '',
            attributes: null,
        };

        const buttonsWrapper = new ElementCreator(buttonsWrapperParams);

        const pages = this.getPages(mainComponent);

        pages.forEach((page, index): void => {
            const linkElement = new LinkButtonView(page, this.headerLinkElements);

            buttonsWrapper.addInnerElement(linkElement.getHtmlElement() as HTMLElement);
            if (index === START_PAGE_INDEX) {
                page.callback();
                linkElement.setSelectedStatus();
            }

            this.headerLinkElements.push(linkElement);
        });

        this.viewElementCreator.addInnerElement(buttonsWrapper);
    }

    private getPages(mainComponent: MainView): Array<{ name: string; callback: () => void }> {
        const garageView = new GarageView();

        const pages = [
            {
                name: NamePages.GARAGE,
                callback: () => mainComponent.setContent(garageView),
            },
            {
                name: NamePages.WINNERS,
                callback: () => {
                    const winnersView = new WinnersView();
                    const winnerWrapper = document.querySelector('.winner-wrapper');
                    if (winnerWrapper) {
                        winnerWrapper.remove();
                    }
                    mainComponent.setContent(winnersView);
                },
            },
        ];

        return pages;
    }
}

export default HeaderView;
