let sampleSize = 1000;
let timeAction = 100;
let lastFreq = 0;
let data = []


const audio = document.getElementById("audio");
const pillarParent = document.getElementById("pillars");
const audioCtx = new(window.AudioContext || window.webkitAudioContext)();

async function load() {
    document.getElementById("sample-size").value = parseInt(sampleSize);
    document.getElementById("action-time").value = parseInt(timeAction);
    await uppdateSampleSize();
    await uppdateActionTime();
}

async function start(){
    function shuffle(array) {
        let currentIndex = array.length;

        while (currentIndex != 0) {
      
            let randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
      
            [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }
    }

    // Create Starting data
    data = [...Array(sampleSize+1).keys()].splice(1);
    shuffle(data);
    spawnPillars(data);

    //wait
    await new Promise(res => setTimeout(res, 1000));

    // Do the sorting algorytm
    console.log(sampleSize)
    await quickSort(data);
    
    //cleanup
    await spawnPillars(data)
    await loopthrough();
    await new Promise(res => setTimeout(res, 1000));
    await spawnPillars(data)

}

async function playNote(_frequency) {

    // Get frequency
    let frequency = parseInt((_frequency- 1)* (400/(sampleSize-1)) + 200)
    if (frequency == lastFreq){
        return
    }

    // Create Audo
    const oscillator = new OscillatorNode(audioCtx);
    const gainNode = new GainNode(audioCtx);
    oscillator.type = "square";
    oscillator.frequency.value = frequency; // value in hertz
    gainNode.gain.value = 0.005;
    oscillator.connect(gainNode).connect(audioCtx.destination);
    oscillator.start();

    //wait before plaing another frequency
    setTimeout(async function() {
        oscillator.stop();
    }, 50);

    lastFreq = frequency+0 // +0 is bacuase i dont want to save the pointer
}

async function loopthrough(){

    for(let i = 1; i <= sampleSize; i++){
        
        playNote(i)

        let pillar = document.getElementById(`pillar-${i}`);
        await new Promise(res => setTimeout(res, 1000/sampleSize));
        pillar.className = `pillar green`;
        pillar.id = `pillar-${i}`;
    }
}

async function spawnPillars(list, p){ //Takes List, Return Void

    let pillarStyle;
    if (sampleSize < 201){
        pillarStyle = 'pillar border'
    }else{
        pillarStyle = 'pillar'
    }

    pillarParent.innerHTML = '';
    for(const i of list){
        let pillar = document.createElement('div');
        if(i == p){
            pillar.className = `${pillarStyle} green`;
            if (document.getElementById("sound-check").checked){
                playNote(i)
            }
        }else{
            pillar.className = `${pillarStyle} gray`;
        }

        pillar.id = `pillar-${i}`;
        pillar.style.height = `${i/sampleSize*90}%`;
        pillar.style.width = `${90/sampleSize}%`;

        pillarParent.appendChild(pillar);
    }

    await new Promise(res => setTimeout(res, timeAction));
}

async function replace_data(sequenceToFind, sequenceToReplace, p){
    let index = 0;

    for(let i = 0; data.length > i; i++){
        if (JSON.stringify(data.slice(i, i+sequenceToFind.length)) == JSON.stringify(sequenceToFind)){
            index = i;
            break
        }
    }

    await spawnPillars(data, p)
    
    for (i = 0; sequenceToFind.length > i; i++){
        data[index+i] = sequenceToReplace[i]
    }
}

async function quickSort(_arr){ //Takes List, Return List
    
    //start of quickSort
    const arr = [..._arr];

    if(arr.length < 2){
        return
    }
    if(arr.length == 2){
        if (arr[0] < arr[1]){
            return
        }
        else{
            await replace_data(arr, [arr[1], arr[0]], [arr[0]]);
            return;
        }
    }

    const p = arr[parseInt(arr.length/2)];
    let below = [];
    let repeat = [];
    let above = [];

    for (let n of arr){
        if (p < n){
            above.push(n);
        }
        else if (p > n){
            below.push(n);
        }
        else {
            repeat.push(p);
        }
    }

    /**
     * Normaly you would just return the vlaues insted of runing replace_data(),
     * but to make the "live" data replacement work we have to do this
     */

    let sequenceToFind = [...arr];
    let sequenceToReplace = [below, repeat, above].flat(200);
    
    await replace_data(sequenceToFind,sequenceToReplace, p)

    await quickSort(below)
    await quickSort(above)
    //End of quickSort
    
}


async function uppdateSampleSize(){
    sampleSize = parseInt(document.getElementById("sample-size").value);
    let display = document.getElementById("sample-text");

    if(!Number.isInteger(sampleSize) || (sampleSize < 4)){sampleSize = 4;}

    display.innerHTML = `Sample Size: ${sampleSize}`;
    spawnPillars([...Array(sampleSize+1).keys()].splice(1), 0)
}

async function uppdateActionTime(){
    timeAction = parseInt(document.getElementById("action-time").value);
    let display = document.getElementById("time-text");

    if(!Number.isInteger(timeAction) ||(timeAction < 4)){timeAction = 4;}

    display.innerHTML = `Time per Action: ${timeAction}ms`;
}