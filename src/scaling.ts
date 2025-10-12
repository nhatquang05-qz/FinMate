
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const guidelineBaseWidth = 414;

export const scale = (size: number): number => (width / guidelineBaseWidth) * size;