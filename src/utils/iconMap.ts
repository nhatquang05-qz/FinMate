import { ImageSourcePropType } from 'react-native';

// Giả sử các icon này nằm trong thư mục:
// src/screen/AddTransaction/
const mealIcon = require('../screen/AddTransaction/fast-food.png');
const transportIcon = require('../screen/AddTransaction/bike.png');
const clothesIcon = require('../screen/AddTransaction/clothes.png');
const medicineIcon = require('../screen/AddTransaction/drugs.png');
const eduIcon = require('../screen/AddTransaction/books.png');
const salaryIcon = require('../screen/AddTransaction/salary.png');
const subsidyIcon = require('../screen/AddTransaction/subsidize.png');
const partimeIcon = require('../screen/AddTransaction/part-time.png');
const bonusIcon = require('../screen/AddTransaction/pay-day.png');
const investIcon = require('../screen/AddTransaction/earning.png');
const friendsIcon = require('../screen/AddTransaction/friends.png');
const piggyBankIcon = require('../screen/AddTransaction/piggy-bank.png');
const defaultIcon = require('../screen/Home/bike.png'); // Icon mặc định nếu không tìm thấy

// Đây là "bộ phiên dịch" của chúng ta
export const iconMap: { [key: string]: ImageSourcePropType } = {
    // Expense Icons
    'food-icon': mealIcon,
    'transport-icon': transportIcon,
    'clothes-icon': clothesIcon,
    'medicine-icon': medicineIcon,
    'education-icon': eduIcon,
    'friends-icon': friendsIcon,

    // Income Icons
    'salary-icon': salaryIcon,
    'subsidy-icon': subsidyIcon,
    'part-time-icon': partimeIcon,
    'bonus-icon': bonusIcon,
    'investment-icon': investIcon,
    'piggy-bank-icon': piggyBankIcon,

    // Default / Fallback Icon
    default: defaultIcon,
};
