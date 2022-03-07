const WindowWidth = window.innerWidth;
const WindowHeight = window.innerHeight;

let mousePosX, mousePosY;

const paperDotsCount = Math.floor (WindowHeight / 36 )
const paperDotsH = 36;
const paperDotsW = 52

const paperW = 1100/1512 * WindowWidth;
const paperMargin = (WindowWidth - paperW) / 2;

const CanvasFront = document.getElementById('design-front')


const paper = document.getElementById('design-paper')

const paperBG = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
paperBG.setAttribute("fill", "white")
paperBG.setAttribute("x", paperMargin )
paperBG.setAttribute("y", 0)
paperBG.setAttribute("width", paperW )
paperBG.setAttribute("height", WindowHeight)
paper.appendChild(paperBG)

const paperLeft = document.createElementNS('http://www.w3.org/2000/svg', 'g');
paperLeft.setAttribute("x", paperMargin)
paperLeft.setAttribute("y", 0)
paper.appendChild(paperLeft)

const paperRight = document.createElementNS('http://www.w3.org/2000/svg', 'g');
paperRight.setAttribute("x", paperMargin + paperW)
paperRight.setAttribute("y", 0)
paper.appendChild(paperRight)

for (let i=0; i<paperDotsCount; i++){

    let singleDot = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        singleDot.setAttribute("href", "#single-dot")
        singleDot.setAttribute("y", i * paperDotsH)
        singleDot.setAttribute("x", paperMargin - paperDotsW)
        paperLeft.appendChild(singleDot)

    let singleDot2 = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        singleDot2.setAttribute("href", "#single-dot")
        singleDot2.setAttribute("y", i * paperDotsH)
        singleDot2.setAttribute("x", paperMargin + paperW)
        paperRight.appendChild(singleDot2)

}

const paperBottom = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
paperBottom.setAttribute("fill", "white")
paperBottom.setAttribute("x", paperMargin - paperDotsW)
paperBottom.setAttribute("y", paperDotsCount * paperDotsH)
paperBottom.setAttribute("width", paperW + paperDotsW * 2)
paperBottom.setAttribute("height", WindowHeight - paperDotsCount * paperDotsH)
paper.appendChild(paperBottom)



const dotC_1 = document.createElement("img")
dotC_1.className = "dots"
dotC_1.src = "./dots/cyan.png"
dotC_1.style.left = `${855/1512 * WindowWidth}px`;
dotC_1.style.top = `${-400/982 * WindowHeight}px`;
CanvasFront.appendChild(dotC_1)

const dotC_2 = document.createElement("img")
dotC_2.className = "dots"
dotC_2.src = "./dots/cyan.png"
dotC_2.style.left = `${1112/1512 * WindowWidth}px`;
dotC_2.style.top = `${147/982 * WindowHeight}px`;
CanvasFront.appendChild(dotC_2)

const dotY = document.createElement("img")
dotY.className = "dots"
dotY.src = "./dots/yellow.png"
dotY.style.left = `${-439/1512 * WindowWidth}px`;
dotY.style.top = `${-61/982 * WindowHeight}px`;
CanvasFront.appendChild(dotY)

const dotM = document.createElement("img")
dotM.className = "dots"
dotM.src = "./dots/magenta.png"
dotM.style.left = `${-147/1512 * WindowWidth}px`;
dotM.style.top = `${684/982 * WindowHeight}px`;
CanvasFront.appendChild(dotM)


const dots = [...document.getElementsByClassName('dots')]
dots.forEach((dot)=>{
    dot.style.position = "absolute"
    dot.style.width = "800px"
    dot.style.height = "800px"
})



CanvasFront.appendChild(paper)


//https://blog.q-bit.me/how-to-create-svg-elements-with-javascript/

// const singleDot = document.createElementNS('http://www.w3.org/2000/svg', 'use');
// singleDot.setAttribute("href", "#single-dot")
// singleDot.setAttribute("x", 200)
// singleDot.setAttribute("y", 100)




//leave out animation bc of performance
// document.onmousemove = (e)=>{
//     mousePosX = e.clientX;
//     mousePosY = e.clientY;

//     dots.forEach((dot)=>{

        
//         dot.style.top = `${ pxToNum(dot.style.top) + Math.sin(mousePosX) * 5}px`
//     })
// }

