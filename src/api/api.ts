const CARS_LIMIT = 7;
const WINNERS_LIMIT = 10;
const path = {
    garage: '/garage',
    engine: '/engine',
    winners: '/winners',
};

export interface CarType {
    name: string;
    color: string;
}

interface RespCarType extends CarType {
    id: number;
}

export interface RespCarTypeWithCount {
    data: RespCarType[];
    carsCount: string;
}

interface RespWinnerType {
    id: number;
    wins: number;
    time: number;
}

interface UpdateWinnerBodyType {
    wins: number;
    time: number;
}

class Api {
    private readonly baseUrl: string;

    constructor() {
        this.baseUrl = 'http://127.0.0.1:3000';
    }

    public async getCarsByPage(pageNumber: number): Promise<RespCarTypeWithCount> {
        const queryParams = `/?_limit=${CARS_LIMIT}&_page=${pageNumber}`;

        const response = await fetch(`${this.baseUrl}${path.garage}${queryParams}`);
        const carsCount = response.headers.get('X-Total-Count') || '0';
        const data = await response.json();
        return { data, carsCount };
    }

    public async getCar(id: number): Promise<RespCarType> {
        const queryParams = `/${id}`;
        const response = await fetch(`${this.baseUrl}${path.garage}${queryParams}`);
        const carData = await response.json();

        return carData;
    }

    public async createCar(carParams: CarType): Promise<Response> {
        try {
            const response = await fetch(`${this.baseUrl}${path.garage}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(carParams),
            });
            return response;
        } catch (err) {
            console.log('createCar error', err);
            throw err;
        }
    }

    public async updateCar(id: number, newCarParams: CarType): Promise<Response> {
        try {
            const response = await fetch(`${this.baseUrl}${path.garage}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newCarParams),
            });
            return response;
        } catch (err) {
            console.log('updateCar error', err);
            throw err;
        }
    }

    public async deleteCar(id: number): Promise<Response> {
        const response = await fetch(`${this.baseUrl}${path.garage}/${id}`, {
            method: 'DELETE',
        });
        console.log('deleteCar response', response);
        return response;
    }

    public async startEngine(id: number): Promise<Response> {
        try {
            const queryParams = `/?id=${id}&status=started`;

            const response = await fetch(`${this.baseUrl}${path.engine}${queryParams}`, {
                method: 'PATCH',
            });
            return response;
        } catch (err) {
            console.log('startEngine error', err);
            throw err;
        }
    }

    public async stopEngine(id: number): Promise<Response> {
        try {
            const queryParams = `/?id=${id}&status=stopped`;

            const response = await fetch(`${this.baseUrl}${path.engine}${queryParams}`, {
                method: 'PATCH',
            });
            return response;
        } catch (err) {
            console.log('stopEngine error', err);
            throw err;
        }
    }

    public async drive(id: number): Promise<Response> {
        try {
            const queryParams = `/?id=${id}&status=drive`;

            const response = await fetch(`${this.baseUrl}${path.engine}${queryParams}`, {
                method: 'PATCH',
            });
            return response;
        } catch (err) {
            console.log('drive error', err);
            throw err;
        }
    }

    public async getWinnersByPage(
        pageNumber = 1,
        sortBy = '',
        sortOrder = ''
    ): Promise<{ result: RespWinnerType[]; winnersCount: string }> {
        const isSortByParamValid = sortBy === 'id' || sortBy === 'wins' || sortBy === 'time';
        const isSortOrderParamValid = sortOrder === 'ASC' || sortOrder === 'DESC';
        try {
            const queryParams = `/?_limit=${WINNERS_LIMIT}&_page=${pageNumber}${
                isSortByParamValid ? `&_sort=${sortBy}` : ''
            }${isSortOrderParamValid ? `&_order=${sortOrder}` : ''}`;
            const response = await fetch(`${this.baseUrl}${path.winners}${queryParams}`);
            const winnersCount = response.headers.get('X-Total-Count') || '0';
            const result = await response.json();

            return { result, winnersCount };
        } catch (err) {
            console.log('getWinnersByPage error', err);
            throw err;
        }
    }

    public async getWinner(id: number): Promise<RespWinnerType> {
        try {
            const queryParams = `/${id}`;
            const response = await fetch(`${this.baseUrl}${path.winners}${queryParams}`);
            const winnerData = await response.json();

            return winnerData;
        } catch (err) {
            console.log('getWinner error', err);
            throw err;
        }
    }

    public async createWinner(winnerParams: RespWinnerType): Promise<RespWinnerType> {
        try {
            const response = await fetch(`${this.baseUrl}${path.winners}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(winnerParams),
            });
            const data = await response.json();
            return data;
        } catch (err) {
            console.log('createWinner error', err);
            throw err;
        }
    }

    public async updateWinner(id: number, newWinnerParams: UpdateWinnerBodyType): Promise<RespWinnerType> {
        try {
            const response = await fetch(`${this.baseUrl}${path.winners}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newWinnerParams),
            });
            const data = await response.json();
            return data;
        } catch (err) {
            console.log('updateWinner error', err);
            throw err;
        }
    }

    public async deleteWinner(id: number): Promise<Response> {
        try {
            const response = await fetch(`${this.baseUrl}${path.winners}/${id}`, {
                method: 'DELETE',
            });
            return response;
        } catch (err) {
            console.log('deleteWinner error', err);
            throw err;
        }
    }
}

const api = new Api();

export { api, Api };
