const KEY_FOR_SAVE_TO_LOCALSTORAGE = 'asyncRaceProgress';

export default class State {
    private fields: Map<string, string>;

    constructor() {
        this.fields = this.loadState();

        window.addEventListener('beforeunload', this.saveState.bind(this));
    }

    public setField(name: string, value: string): void {
        this.fields.set(name, value);
    }

    public getField(name: string): string {
        if (this.fields.has(name)) {
            return this.fields.get(name)!;
        }
        return '';
    }

    private saveState(): void {
        const fiedlsObject = Object.fromEntries(this.fields.entries());
        localStorage.setItem(KEY_FOR_SAVE_TO_LOCALSTORAGE, JSON.stringify(fiedlsObject));
    }

    private loadState(): Map<string, string> {
        const storageItem = localStorage.getItem(KEY_FOR_SAVE_TO_LOCALSTORAGE);
        if (storageItem) {
            const fieldObject = JSON.parse(storageItem);
            return new Map(Object.entries(fieldObject));
        }
        return new Map();
    }
}
