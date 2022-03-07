const CMYK = new Map([
    ['c', 'cyan' ],
    ['m','magenta' ],
    ['y', 'yellow' ],
    ['cmy', 'black' ],
    ['cm', 'blue' ],
    ['yc', 'green'],
    ['ym', 'red'],
    ['cym', 'black' ],
    ['mcy', 'black' ],
    ['ycm', 'black' ],
    ['myc', 'black' ],
    ['ymc', 'black' ], 
    ['mc', 'blue' ],
    ['cy', 'green'],
    ['my', 'red'],


  ]);

const grid_w = 100, grid_h = 100, width = 1010, height = 600;
const grid_counts = 10; //10 color blocks for each row

let isSetup = false;
let me, ppl, shared, canvas;
let rows, cols;

let GRIDCOLOR = []; //color code for each block, set by the host player

const drawMainCanvas = (sketch) =>{

  sketch.preload = function(){
  
    sketch.partyConnect(
      "wss://deepstream-server-1.herokuapp.com",
      "hello_jessie_color",
      "main01",
    () => {
      console.log("connected!");
    }
    );

    me = sketch.partyLoadMyShared();
    ppl = sketch.partyLoadParticipantShareds();
    shared = sketch.partyLoadShared("shared");

  }//end of preload


  
 sketch.setup = function() {
      // me.x = mouseX || width/2;
      // me.y = mouseY || height/2;

      if (sketch.partyIsHost()){

        sketch.updateGridColor();

        sketch.partySetShared(shared, { state: 'game_init', gridColor:GRIDCOLOR, locs:[] });

        // shared.state = 'game_init';
        // shared.gridColor = sketch.updateGridColor();
      }

      shared.state = shared.state || "game_init";
      shared.gridColor = shared.gridColor || [];

      me.state = "onboarding";
      me.id = Math.random()*10;
      me.pos = getRandom(0,9);
      me.color = getColorKey(getRandom(0,2)) 
      // let x = mouseX < width? mouseX : width/2;
      // let y = mouseY < height? mouseY : height/2;

      let x = width/2;
      let y = height/2;

      shared.locs.push([x, y]);
      
      
      canvas = sketch.createCanvas(width, height);
    
      
      isSetup = true;
      
      [rows, cols] = sketch.calculateGrid();
      
      sketch.keyPressed();

}

      sketch.draw = function() {
        sketch.clear();
        sketch.background(220);

        if (shared.state === "game_init"){

          switch(me.state){
            case "onboarding":
              sketch.displayOnboard();
              break;
  
            case "ready":
              sketch.displayReady();
  
          }

        }else if(shared.state === "game_start"){

          sketch.displayGameStart();

        }else if(shared.state === "game_end"){

          sketch.displayGameEnd();
        }



        sketch.updateSharedState();


      }//end of draw

      sketch.displayOnboard = function(){

        
        sketch.background(sketch.color(51));
        // sketch.fill(getCMYKbyIndex(me.colorIndex))
        // sketch.rect(cols[0], rows[0],10,10)


      };

      sketch.displayReady = function(){

        console.log('ready!')
        
      };

      sketch.displayGameStart = function(){
              //set timer

              let c, grid_margin, r, s, grid_stroke;
              let session = 240;
              let players = new Array(10).fill('');

              grid_margin = grid_h * 0.52;
              grid_stroke = grid_h * 0.30;
              r = grid_h / 1.5;

              if(sketch.partyIsHost()){

                 if ( sketch.frameCount % session === 0){

                  sketch.updateGridColor();
                  sketch.partySetShared(shared, { ...shared, gridColor: GRIDCOLOR});
                 
                  
                 }
              }
       
              //color blocks
              for (let i=0; i<3; i++){
                for (let j=0; j<grid_counts; j++){
                  c = sketch.color(shared.gridColor[i][j])
                  // s = i === 0 ? grid_stroke: grid_stroke/2;

               
                  sketch.drawingContext.setLineDash([5, i*20, 5, i*20]);
                  
            
                  sketch.strokeWeight(grid_stroke)
                  sketch.stroke(c)
                  sketch.noFill()
                  sketch.ellipse(j*grid_w + grid_w/2 + grid_margin/2, height/2 + grid_w/2 + grid_margin/2, grid_w - grid_margin, grid_h - grid_margin )
                }
              }

              //players
              ppl.forEach((person)=>{

                players[person.pos] += person.color;              

              })

              for (let j=0; j<grid_counts; j++){

                if (players[j] !== ''){
         

                  c = sketch.color(CMYK.get(players[j]))
                  sketch.fill(c)
                  sketch.noStroke()
                  sketch.ellipse(j*grid_w + grid_w/2 + grid_margin/2 , height/2 + grid_w/2 + grid_margin/2, r, r)
                }
              }


        
      };

      sketch.displayGameEnd = function(){

        
      };

      sketch.calculateGrid = function(){
        let c = shared.locs.map( (d)=>d[0]);
        let r = shared.locs.map( (d)=>d[1]);
        
        return [c, r]
      }
      

      sketch.keyPressed = function() {
        let step = 20;
        
        if (sketch.keyCode === sketch.ENTER) {
      
          me.state = "ready";
      
        }

        if (shared.state === "game_start"){
          if (sketch.keyCode === sketch.LEFT_ARROW){
            me.pos = me.pos-1 > -1 ? me.pos-1 : 0;
            console.log(me.pos)
          }

          if (sketch.keyCode === sketch.RIGHT_ARROW){
            me.pos = me.pos+1 < grid_counts ? me.pos+1 : grid_counts;
            console.log(me.pos)
          }
        }

      
        return false; 
      
      }

      sketch.updateSharedState = async function(){

        if (shared.state === "game_init"){

            let isReady = new Promise((resolve)=>{

              ppl.forEach((person)=>{
                if (person.state !== 'ready'){
                  resolve(false);   
                }
              })

              resolve(true);

            })

            let isReadyResult = await isReady;

            if (isReadyResult){ 
              shared.state = "game_start"
              console.log('group ready')


            }

        }


      };

  
      sketch.updateGridColor = function(){

       
        if (GRIDCOLOR.length === 0){

           //initial update
          for(let i=0; i<3; i++){

            GRIDCOLOR[i] = [];
  
            for (let j=0; j<grid_counts; j++){
           
              GRIDCOLOR[i].push(getRandomItem(CMYK));
  
            }
          }
        }else{
          //else, only need to add one more row
            GRIDCOLOR.push([])
            for (let j=0; j<grid_counts; j++){
            
              GRIDCOLOR[GRIDCOLOR.length-1].push(getRandomItem(CMYK));

            }
            GRIDCOLOR.shift();
        }


        return GRIDCOLOR;
      }
  
}//end of drawMainCanvas



let mainCanvas = new p5(drawMainCanvas, 'mainCanvas');


function getRandom(start, end){
  return Math.floor(Math.random() * (end - start + 1) + start);
}

//result: one of the 8 colors 
const getRandomItem = CMYK => CMYK.get([...CMYK.keys()][Math.floor(Math.random() * 8)])
      
const getColorKey = idx => [...CMYK.keys()][idx]

function onDataChange() {
  // addPeople();
  // setNewPaw();
  // draw();
}

//https://keycode.info/



// function keyPressed() {
//   let step = 20;
    
//   switch(key) {   
//     case 'w': me.y = Math.max(0.0, me.y-step ); break;
//     case 'd': me.x = Math.min(width, me.x + step );break;    
//     case 's': me.y = Math.min(height, me.y + step );break;
//     case 'a': me.x = Math.max(0.0, me.x-step ); break;
//   }

//   return false; 

// }

function keyMove() {
  let step = 20;
    
    if (keyIsDown(87)) me.y = Math.max(0.0, me.y-step ); 
    if (keyIsDown(68)) me.x = Math.min(width, me.x + step );
    if (keyIsDown(83)) me.y = Math.min(height, me.y + step );
    if (keyIsDown(65)) me.x = Math.max(0.0, me.x-step ); 
}