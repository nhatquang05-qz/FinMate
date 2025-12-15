import { ImageSourcePropType } from 'react-native';



const mealIcon = require('../assets/images/fast-food.png');
const transportIcon = require('../assets/images/bike.png');
const clothesIcon = require('../assets/images/clothes.png');
const medicineIcon = require('../assets/images/drugs.png');
const eduIcon = require('../assets/images/books.png');
const salaryIcon = require('../assets/images/salary.png');
const subsidyIcon = require('../assets/images/subsidize.png');
const partimeIcon = require('../assets/images/part-time.png');
const bonusIcon = require('../assets/images/pay-day.png');
const investIcon = require('../assets/images/earning.png');
const friendsIcon = require('../assets/images/friends.png');
const piggyBankIcon = require('../assets/images/piggy-bank.png');
const defaultIcon = require('../assets/images/bike.png'); 


export const iconMap: { [key: string]: ImageSourcePropType } = {
    
    'food-icon': mealIcon,
    'transport-icon': transportIcon,
    'clothes-icon': clothesIcon,
    'medicine-icon': medicineIcon,
    'education-icon': eduIcon,
    'friends-icon': friendsIcon,

    
    'salary-icon': salaryIcon,
    'subsidy-icon': subsidyIcon,
    'part-time-icon': partimeIcon,
    'bonus-icon': bonusIcon,
    'investment-icon': investIcon,
    'piggy-bank-icon': piggyBankIcon,

    
    default: defaultIcon,
};
