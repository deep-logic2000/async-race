import { carBrands, carModels } from './carsModels';
import { CarType } from '../../api/api';

const generateCarName = (): string => {
    const brand = carBrands[Math.floor(Math.random() * carBrands.length)];
    const model = carModels[Math.floor(Math.random() * carModels.length)];
    return `${brand} ${model}`;
};

const generateCarColor = (): string => {
    const letters = '0123456789ABCDEF';
    let color = '#';

    for (let i = 0; i < 6; i += 1) {
        color += letters[Math.floor(Math.random() * 16)];
    }

    return color;
};

const generateCars = (carsCount: number): CarType[] => {
    const cars = [];
    for (let i = 0; i < carsCount; i += 1) {
        const car = {
            name: generateCarName(),
            color: generateCarColor(),
        };
        cars.push(car);
    }
    return cars;
};

export default generateCars;
