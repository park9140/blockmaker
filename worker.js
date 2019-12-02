import words from 'raw-loader!./words.txt';
import _ from 'lodash';
const numbers = "1234567890"
const letters = "abcdefghijkmnlopqrstuvwxyz";
const letterBits = "1234567890abcdefghijkmnolpqrstuvwxyz"
    .split("")
    .reduce(
        (letters, letter, index) => ({
            [letter]: BigInt(Math.pow(2, index + 1)),
            ...letters
        }),
        {}
    );

let totalWords = 0;
let wordsSupported = 0;
const blocks = _.shuffle(words
    .split("\n")
    .map(word => word.trim().toLowerCase()))
    //.sort((a, b) => (a.length < b.length ? -1 : a.length > b.length ? 1 : 0))
    //.filter(w => w.length < 49)
    .reduce((blocks, w) => {

        const randomBlocks = _.shuffle(blocks);
        let blocksUsed = BigInt(0);

        const neededLetters = w.split("").filter(letter => letterBits[letter]).reduce((lettersNeeded, letter) => {
            const foundBlock = randomBlocks.find((block, index) => {
                if (blocksUsed & block.indexBit) {
                    return false;
                }
                if (block.bits & letterBits[letter]) {
                    blocksUsed = blocksUsed | block.indexBit;
                    return true;
                }
                return false;
            });

            if (!foundBlock) {
                lettersNeeded.push(letter);
            }
            return lettersNeeded;
        }, []);


        const wordSupported = neededLetters.reduce((wordSupported, letter) => {
            let openBlock = randomBlocks.find((block, index) => {
                if (block.letters.length === 5 || blocksUsed & block.indexBit) {
                    return false;
                }
                if (block.bits & letterBits[letter]) {
                    return false;
                }
                return block;
            });

            if (openBlock) {
                openBlock.bits = openBlock.bits | letterBits[letter];
                openBlock.letters.push(letter);

                blocksUsed = blocksUsed | openBlock.indexBit;

                return wordSupported;
            }

            return false;
        }, true);
        if (wordSupported) {
            wordsSupported++;
        } else {
            //console.log(w, w.length, neededLetters);
        }
        totalWords++;
        return blocks;
    }, _.range(0,26).map((key)=> ({
        bits: (letters[key] ? letterBits[letters[key]] : BigInt(0)) | (numbers[key] ? letterBits[letters[key]] : BigInt(0)),
        letters: [letters[key], numbers[key]].filter(_.identity),
        indexBit: BigInt(Math.pow(2,key + 1))
    })))
postMessage({ blocks, wordsSupported, totalWords })