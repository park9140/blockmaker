import blockRandomizer from 'worker-loader?inline=true!./worker.js';
import 'google-font-to-svg-path';
import opentype from 'google-font-to-svg-path/opentype.js';
import _ from 'lodash';


const uiLetters = _.reduce('A B C D E F G H I J K L M N O P Q R S T U V W X Y Z 1 2 3 4 5 6 7 8 9 0'.toLowerCase().split(' '), (memo, letter, index) => ({ ...memo, [letter]: index}), {});
let corners = [];
let sides = [];
let cornerTick = 0;
let sideTick = 0;
window.opentype = opentype;
const its = document.createElement('div');
document.body.appendChild(its);
const works = document.createElement('div');
document.body.appendChild(works);
const words = document.createElement('div');
document.body.appendChild(words);
const dropExtraSides = document.createElement('div');
document.body.appendChild(dropExtraSides);
dropExtraSides.className = 'dropArea';
dropExtraSides.textContent = 'Drop extra sides here';

const button1 = document.createElement('button');
document.body.appendChild(button1);
button1.textContent = 'get best faces';
const button = document.createElement('button');
document.body.appendChild(button);
button.textContent = 'create best';

const buttonDownload = document.createElement('button');
document.body.appendChild(buttonDownload);
buttonDownload.textContent = 'download';

const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
document.body.appendChild(svg);

function getLetter(letter) {
    if (!letter) {
        const side = sides[sideTick % sides.length];
        if (!side) {
            return;
        }
        sideTick++;
        return side.group.cloneNode(true);
    }
    return document.querySelector('#svgGroup').children[uiLetters[letter]].cloneNode(true);
}


const maxWorkers = 7;
let workersRunning = 0;
const maxItterations = 1000;
let itterations = 0;
function runWorker() {
    if (workersRunning >= maxWorkers || itterations > maxItterations) {
        return;
    }
    itterations++;
    its.textContent = `Itterations: ${itterations}`;
    var myWorker = new blockRandomizer();
    workersRunning++;
    works.textContent = `workersRunning: ${workersRunning}`;
    myWorker.onmessage = (e) => {
        const rawBlock = localStorage.getItem('bestBlock25');
        let bestBlock;
        if (rawBlock) {
            bestBlock = JSON.parse(rawBlock);
        }
        
        myWorker.terminate();
        workersRunning--;
        works.textContent = `workersRunning: ${workersRunning}`;
        console.log((e.data.wordsSupported / e.data.totalWords) * 100);
        if (!bestBlock || bestBlock.totalWords < e.data.totalWords || bestBlock.wordsSupported < e.data.wordsSupported && bestBlock.blocks.length >= e.data.blocks.length) {
            console.log((e.data.wordsSupported / e.data.totalWords) * 100);
            bestBlock = e.data;
            localStorage.setItem('bestBlock25', JSON.stringify(e.data, (key, value) => (
                typeof value === 'bigint'
                    ? value.toString()
                    : value // return everything else unchanged
            )))
            button.onclick();
        }
        words.textContent = `words: ${bestBlock.wordsSupported} / ${bestBlock.totalWords} = ${bestBlock.wordsSupported / bestBlock.totalWords}`;
        runWorker();
    }
    myWorker.postMessage([]);
    runWorker();
}

button1.onclick = runWorker;

function createBlock(letter) {
    const svg = getLetter(letter);
    
}
const oneInch = 96;
button.onclick = () => {
    const rawBlock = localStorage.getItem('bestBlock25');
    if (!rawBlock) {
        console.log('no best found');
        return;
    }

    let bestBlock = JSON.parse(rawBlock);
    
    const sizeInches = parseFloat(document.querySelector('#block-size').value) * oneInch;
    const marginInches = parseFloat(document.querySelector('#block-margin').value) * oneInch;
    const paddingInches = parseFloat(document.querySelector('#block-padding').value) * oneInch;
    const columns = parseInt(document.querySelector('#block-columns').value);
    const targetSize = sizeInches - 2*paddingInches;

    svg.innerHTML = '';
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('width', '200in');
    svg.setAttribute('height', '12in');
    svg.setAttribute('viewBox', '0 0 19200 1152');
    svg.style.width = '19200px';
    svg.style.height = '1152px';
    svg.style.display = 'block';

    const svgBounds = svg.getBoundingClientRect();
    

    let row = 0;
    _.range(0, 6).forEach((key) => {
        const faceX = key * (columns * (marginInches + sizeInches) + oneInch);

        bestBlock.blocks.forEach(({ letters }, index) => {
            const face = document.createElementNS('http://www.w3.org/2000/svg','g');
            svg.appendChild(face);
            const bounds = document.createElementNS('http://www.w3.org/2000/svg','rect');
            face.appendChild(bounds);

            const column = index % columns;
            const row = Math.floor(index / columns)

            const x = faceX + column * (sizeInches + marginInches);
            const y = row * (sizeInches + marginInches);

            bounds.setAttribute('width', sizeInches);
            bounds.setAttribute('height', sizeInches);
            bounds.setAttribute('stroke', 'red');
            bounds.setAttribute('fill', 'none');
            bounds.setAttribute('x', x);
            bounds.setAttribute('y', y);

            const letter = getLetter(letters[key]);
            if (letter) {
                face.appendChild(letter);

                const bounds = letter.getBoundingClientRect();
                const xScale = targetSize/bounds.width;
                const yScale = targetSize/bounds.height;
                const scale = Math.min(xScale, yScale);
                const xPadding = (targetSize - scale * bounds.width)/2
                const yPadding = (targetSize - scale * bounds.height)/2
                const transX = x + paddingInches + xPadding + ((bounds.left - svgBounds.left) * -1) * scale;
                const transY = y + paddingInches + yPadding + ((bounds.top - svgBounds.top) * -1) * scale;

                letter.setAttribute('fill', 'black');
                letter.setAttribute('fill-rule', 'evenodd');
                letter.setAttribute('transform', `matrix(${scale} 0 0 ${scale} ${transX} ${transY})`);       
            }
        });        
    })
}

document.querySelector('#block-size').addEventListener('change', button.onclick);
document.querySelector('#block-margin').addEventListener('change', button.onclick);
document.querySelector('#block-padding').addEventListener('change', button.onclick);
document.querySelector('#block-columns').addEventListener('change', button.onclick);
const observer = new MutationObserver(button.onclick);
observer.observe(document.querySelector('#svg-render'), { attributes: true, childList: true, subtree: true })


  
function preventDefaults (e) {
    e.preventDefault()
    e.stopPropagation()
}

;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropExtraSides.addEventListener(eventName, preventDefaults, false)
})
  
function highlight(e) {
    dropExtraSides.classList.add('highlight')
}

function unhighlight(e) {
    dropExtraSides.classList.remove('highlight')
}

;['dragenter', 'dragover'].forEach(eventName => {
    dropExtraSides.addEventListener(eventName, highlight, false)
})

;['dragleave', 'drop'].forEach(eventName => {
    dropExtraSides.addEventListener(eventName, unhighlight, false)
})


 async function handleDropSides(e) {
  let dt = e.dataTransfer
  let files = dt.files

  const newSides = await Promise.all(([...files]).map(async file => {
    const holder = document.createElement('div');
    const group = document.createElementNS('http://www.w3.org/2000/svg','g');
    holder.innerHTML = await file.text();
    ([...holder.querySelectorAll('svg > path, svg > g')]).forEach(component => group.appendChild(component));

    return { name: file.name, group };
  }));
  sides = sides.concat(newSides);
  sides = _.uniqBy(sides, 'name');
  button.onclick();
}

dropExtraSides.addEventListener('drop', handleDropSides, false)

buttonDownload.onclick = () => {
    const filename = 'blocks.svg'

    var blob = new Blob(['<?xml version="1.0"?>' + svg.outerHTML], {type: 'text/image/svg+xml'}),
        e    = document.createEvent('MouseEvents'),
        a    = document.createElement('a')

    a.download = filename
    a.href = window.URL.createObjectURL(blob)
    a.dataset.downloadurl =  ['image/svg+xml', a.download, a.href].join(':')
    e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
    a.dispatchEvent(e)
}