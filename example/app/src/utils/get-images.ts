import { ImageSourcePropType } from "react-native"

const img_0 = require('../../assets/bg-images/0.jpg')
const img_1 = require('../../assets/bg-images/1.jpg')
const img_2 = require('../../assets/bg-images/2.jpg')
const img_3 = require('../../assets/bg-images/3.jpg')
const img_4 = require('../../assets/bg-images/4.jpg')
const img_5 = require('../../assets/bg-images/5.jpg')
const img_6 = require('../../assets/bg-images/6.jpg')
const img_7 = require('../../assets/bg-images/7.jpg')
const img_8 = require('../../assets/bg-images/8.jpg')
const img_9 = require('../../assets/bg-images/9.jpg')

export function getImages(length: number = 10): ImageSourcePropType[] {
    const imageList = [img_0, img_1, img_2, img_3, img_4, img_5, img_6, img_7, img_8, img_9];
    if (length < 1) {
        return []
    }

    if (length > imageList.length) {
        return [
            ...Array.from({ length: length / imageList.length }, () => imageList).flat(),
            ...imageList.slice(0, length % imageList.length)
        ]
    }

    return imageList.slice(0, length - 1)
}