import './winners-row.scss';
import { api } from '../../../../../../api/api';
import svg from '../../../garage/raceSection/race-car-view/car-img';

interface WinnersRowType {
    id: number;
    wins: number;
    time: number;
}

class WinnersRow {
    private row: HTMLTableRowElement;

    constructor(
        private winnersRowData: WinnersRowType,
        private rowNumber: number
    ) {
        this.winnersRowData = winnersRowData;
        this.row = document.createElement('tr');
        this.row.classList.add('winners__row');

        this.configureView();
    }

    private async configureView(): Promise<void> {
        const { name, color } = await this.getWinnerCarData();
        const data = [color, name, this.winnersRowData.wins, this.winnersRowData.time];

        const tableNumberCell = document.createElement('td');
        tableNumberCell.classList.add('table-cell');
        tableNumberCell.innerText = this.rowNumber.toString();
        this.row.append(tableNumberCell);
        data.forEach((item, index) => {
            const tableCell = document.createElement('td');
            if (index === 0) {
                tableCell.classList.add('table-cell', 'table-cell__image');
                const carImageWrapper = document.createElement('div');
                carImageWrapper.classList.add('car-image-wrapper');
                carImageWrapper.innerHTML = svg;
                carImageWrapper.style.fill = item.toString();
                tableCell.append(carImageWrapper);
                this.row.append(tableCell);
                return;
            }
            tableCell.classList.add('table-cell');
            tableCell.innerText = item.toString();
            this.row.append(tableCell);
        });
    }

    private async getWinnerCarData(): Promise<{ name: string; color: string }> {
        const carData = await api.getCar(this.winnersRowData.id);

        return carData;
    }

    public getWinnersRowHtml(): HTMLTableRowElement {
        return this.row;
    }
}

export default WinnersRow;
