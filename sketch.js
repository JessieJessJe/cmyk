const CMYK = new Map([
    ['c', 'cyan' ],
    ['m','magenta' ],
    ['y', 'yellow' ],
    ['cmy', 'black' ],
    ['cm', 'blue' ],
    ['cy', 'green'],
    ['my', 'red'],

  ]);

const grid_w = 50, grid_h = 50, width = 500, height = 400;

let isSetup = false;
let me, ppl, shared, canvas;
let rows, cols;

let LINE = [];

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
        shared.state = 'game_init';
      }
  
      me.state = "onboarding";

      shared.locs = shared.locs || [];


      // let x = mouseX < width? mouseX : width/2;
      // let y = mouseY < height? mouseY : height/2;

      let x = width/2;
      let y = height/2;

      shared.locs.push([x, y]);
      
      
      canvas = sketch.createCanvas(width, height);
    
      
      isSetup = true;
      
      [rows, cols] = sketch.calculateGrid();
      


}



      sketch.draw = function() {

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





      }//end of draw

      sketch.displayOnboard = function(){

        
        sketch.background(sketch.color(51));
        sketch.fill(CMYK.get('c'))
        sketch.rect(cols[0], rows[0],10,10)

        sketch.keyPressed();

      };

      sketch.displayReady = function(){

        console.log('ready!')
        
      };

      sketch.displayGameStart = function(){

        
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
        
        if (keyCode === SPACE) {
      
          me.state = "ready";
      
        }
      
        return false; 
      
      }
  
}//end of drawMainCanvas



let mainCanvas = new p5(drawMainCanvas, 'mainCanvas');


function getRandom(start, end){
  return Math.floor(Math.random() * (end - start + 1) + start);
}





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