import HeaderView from '../view/header/header';
import MainView from '../view/main/main';
import State from '../../state/state';

class App {
    rootElement: HTMLElement | null;

    state: State;

    constructor() {
        this.rootElement = document.body;
        this.state = new State();
        this.createView();
    }

    private createView(): void {
        if (!this.state.getField('pageNumber')) {
            this.state.setField('pageNumber', '1');
        }
        const main = new MainView();
        const header = new HeaderView(main);
        const headerElement = header.getHtmlElement();
        const mainElement = main.getHtmlElement();

        this.rootElement?.append(headerElement as HTMLElement, mainElement as HTMLElement);
    }
}

export default App;
