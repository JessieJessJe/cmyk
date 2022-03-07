


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

const CMYK_SET = ['c', 'm', 'y', 'cm', 'cy', 'my', 'cmy']

const width = 1050 * WindowWidth / 1512, height = 600 * width / 1050 ;
const grid_w = 100 / 1050 * width, grid_h = grid_w;
const grid_counts = 10; //10 color blocks for each row

//each session, plays have  -- 3 seconds to get ready -- 5 seconds to move -- 2 seconds for result
let move_length = 300,  session = 600; // multiply by 60 frames/sec

let offset = 0
let unit = 1; //each round, plays have 3 seconds to move

let isSetup = false;
let me, ppl, shared, canvas;

let hostTimeStamp = 0, rounds = 5;

let GRIDCOLOR = []; //color code for each block, set by the host player
let players = [];
let img;

const drawMainCanvas = (sketch) =>{

  sketch.preload = function(){

    img = sketch.loadImage('sketch4.png');
  
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
      sketch.partyToggleInfo(false);

      if (sketch.partyIsHost()){

        sketch.updateGridColor();

        sketch.partySetShared(shared, { state: 'game_init', gridColor:GRIDCOLOR, move: false, session_state: 'loading', countDown: 3, rounds: rounds, winners: [], offset: 0 });
      }

      // shared.state = shared.state || "game_init";
      // shared.gridColor = shared.gridColor || [];

      me.state = "onboarding";
      me.id = getRandomEmoji();
      me.pos = getRandom(0,9);
      me.score = 0;
      me.color = getColorKey(getRandom(0,2)) 
      // let x = mouseX < width? mouseX : width/2;
      // let y = mouseY < height? mouseY : height/2;

      let x = width/2;
      let y = height/2;

      
      
      canvas = sketch.createCanvas(width, height);
    
      
      isSetup = true;

      
      sketch.keyPressed();

      sketch.textAlign(sketch.CENTER, sketch.CENTER);

}

      sketch.draw = function() {
        sketch.clear();
        sketch.background(255);

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


        if (sketch.partyIsHost()){
          sketch.updateSharedState();
        }



      }//end of draw

      sketch.displayOnboard = function(){

        sketch.image(img, 0, 0, width, height);
        // sketch.background(sketch.color(255));


      };

      sketch.displayReady = function(){

        sketch.textSize(32)

        let player_profile = ppl.filter( (person) => person.state === "onboarding" )
                                .map( (person) => person.id). join(` `);
        
        sketch.text( `Waiting for ${player_profile} to start`, width/2, height/2)

        sketch.textSize(16)
        sketch.text( `Or press ENTER to return`, width/2, height/2 + 48)
   
        
      };

      sketch.endOfRound = function(){

        shared.winners = [];

        players.forEach((player, index)=>{
 
            if (GRIDCOLOR[0][index] === CMYK.get(player)){

              //in order to display winning effects
              shared.winners.push(index)
              
          
          }
        })

      //calculate scores
      ppl.forEach( (person)=>{

        let my_position = person.pos;

        if (CMYK.get(players[my_position]) == GRIDCOLOR[0][my_position]){

          switch( players[my_position].length){
            case 3:
              person.score += 10;
              break;
            case 2:
              person.score += 5;
              break;
            case 1:
              person.score += 1;
              break;
          }
    
         }

      })


      }



      sketch.displayGameStart = function(){
              players = [];
    
              let c, grid_margin, r, grid_stroke;
      

              grid_margin = grid_h * 0.40;
              grid_stroke = grid_h * 0.10;
              r = grid_h / 1.8;

              if(sketch.partyIsHost()){
                 
                 if (!hostTimeStamp){ hostTimeStamp = sketch.frameCount}

                 if ( (sketch.frameCount-hostTimeStamp) % session === 0){

                  rounds --;
                  offset = 0;
                  sketch.updateGridColor();
                  sketch.partySetShared(shared, { ...shared, gridColor: GRIDCOLOR, session_state: "ready", countDown: 3, offset: 0, rounds: rounds, winners: []});
                 
                  setTimeout(()=>{

                    shared.move = true;                 
  
                  }, 3000)

                  setTimeout(()=>{
                    shared.move = false;

                    sketch.endOfRound();

                  }, 8000)  //3"ready + 5"move = 8"
                  
                 }else{

                    if ( (sketch.frameCount-hostTimeStamp) % 60 === 0 && shared.countDown === 3){ shared.countDown = 2}
                    if ( (sketch.frameCount-hostTimeStamp) % 120 === 0 && shared.countDown === 2){ shared.countDown = 1}
                }


            }

            if(shared.session_state === "ready"){

              if (shared.move){

                if (sketch.partyIsHost()){ 
                  shared.offset += unit; 
                  
                }

                offset = shared.offset * grid_h /  move_length;
                
              }


              //display color blocks
              for (let i=0; i<3; i++){
                for (let j=0; j<grid_counts; j++){
                  c = sketch.color(shared.gridColor[i][j])
 
                  sketch.drawingContext.setLineDash([5, (i+1)*8, 5, (i+1)*8]);
               
                  sketch.stroke(c )
                  sketch.noFill();
                  sketch.strokeWeight(grid_stroke /  (i+2))
        
             
                  sketch.ellipse(j*grid_w + grid_w/2 + grid_margin/2, 
                                  height/2 - i*grid_h + offset , 
                                  grid_w - grid_margin, 
                                  grid_h - grid_margin )

                  }        
              }

              //display players
              ppl.forEach((person)=>{

                if(players[person.pos] === undefined){
                  players[person.pos] = person.color; 

                } else if(!players[person.pos].includes(person.color)){
                  players[person.pos] += person.color; 

                }              

              })

              for (let j=0; j<grid_counts; j++){

                if (players[j] !== undefined){

                  c = sketch.color(CMYK.get(players[j]))
                  if(c !== undefined){

                    sketch.fill(c)
                    sketch.noStroke()
                    sketch.ellipse(j*grid_w + grid_w/2 + grid_margin/2 , 
                                    height/2 + grid_h, 
                                    r, r)
                  }

                }
              }

              //display players name
              sketch.textSize(30)
              ppl.forEach((person)=>{
 
                sketch.text( person.id, person.pos*grid_w + grid_w/2 + grid_margin/2 , 
                  height/2 + grid_h * 2 - grid_margin, 
                  )
              })

              sketch.fill(0)
              sketch.text( '***', me.pos*grid_w + grid_w/2 + grid_margin/2 , 
                height/2 + grid_h * 2 - grid_margin + 30, 
                )
              

              sketch.fill(255)
              sketch.rect(0,0, width, height * 0.25)

              //text info

              sketch.fill(0)
              sketch.textSize(16)
              sketch.text(`Round ${ 5-shared.rounds}/4`, width / 2, height * 0.07)

              sketch.textSize(32)

              if(shared.move === true){

                sketch.text('MOVE!', width / 2, height * 0.12)
              }

              if(shared.offset === 0 && shared.move === false){
          
                sketch.text(shared.countDown, width / 2, height * 0.12)
        
              }

              if(shared.offset !== 0 && shared.move === false){
    

                let msg2 = `( ′～‵) try again`;
                    //winnder effect
                    shared.winners.forEach((pos)=>{

                      let msg;

                      if (players[pos]){
                        switch (players[pos].length){
                          case 1:
                            msg = '+1';
                            msg2 = `You've got this!`
                            break;
                          case 2:
                            msg = '+5';
                            msg2 = `└( ▼▼)┐ Excellent!`;
                            break;
                          case 3:
                            msg = '+10';
                            msg2 = `//(*▼▽▼)∩// Terrific!`
                            break;
                        }
  
                        sketch.text(msg , pos * grid_w + grid_w/2 + grid_margin/2, height/2 + grid_h )
                      }


       
                    }) 
                sketch.text(msg2 , width / 2, height * 0.12 )
              }

            }

      };

      sketch.displayGameEnd = function(){

        sketch.textSize(32)

        let player_profile = ppl;
        player_profile.sort( (a,b)=> b.score - a.score)

        sketch.text( `${player_profile[0].id} Wins!`, width/2, height/2)

        if(sketch.partyIsHost()){
          setTimeout(() => {

            shared.state = "game_init"
            ppl.forEach((person)=>{
              person.score = 0;
            })
            
          }, 3000);
        }
        
      };

      sketch.keyPressed = function() {

        if(shared.state === "game_init"){

          if (sketch.keyCode === sketch.ENTER) {
      
            me.state = me.state === "ready" ? "onboarding" : "ready";
        
          }
        }


        if (shared.state === "game_start" && shared.move === true){
          if (sketch.keyCode === sketch.LEFT_ARROW || sketch.keyCode === 65){
            me.pos = me.pos-1 > -1 ? me.pos-1 : 0;
         
          }

          if (sketch.keyCode === sketch.RIGHT_ARROW || sketch.keyCode === 68){
            me.pos = me.pos+1 < grid_counts ? me.pos+1 : grid_counts-1;
    
          }
        }

      
        return false; 
      
      }

      sketch.assignPlayerColor = function(){

        let template = shuffle(['c', 'm', 'y'])

        ppl.forEach((person, idx)=>{

          person.color = template[idx % 3]

        })
      }

      sketch.updateSharedState = async function(){

        if (shared.state === "game_init" ){

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

              sketch.assignPlayerColor();

              shared.state = "game_start"

           
              shared.rounds = 5; 
              rounds = 5;


              ppl.forEach((person)=>{
                person.score = 0
                person.state = "onboarding"
              })

            }

        }else if (shared.state === "game_start" && shared.rounds === 0 ){
          shared.state = "game_end"
        }


      };

  
      sketch.updateGridColor = function(){

       
        if (GRIDCOLOR.length === 0){

           //initial update
          for(let i=0; i<3; i++){

            GRIDCOLOR[i] = getRowColor();
  
          }
        }else{
          //else, only need to add one more row
            GRIDCOLOR.push(getRowColor())  
            GRIDCOLOR.shift();
        }


        return GRIDCOLOR;
      }

  
}//end of drawMainCanvas


function shuffle(array) {
  array.sort(() => Math.random() - 0.5);
  return array;
}

function getRandom(start, end){
  return Math.floor(Math.random() * (end - start + 1) + start);
}

function getRowColor(){

  let row = ['cyan', 'magenta', 'yellow'];
  for (let i=0; i< grid_counts-3; i++ ){
    row.push(CMYK.get(CMYK_SET[getRandom(0,6)]))
  }
  return shuffle(row);
}

//result: one of the 8 colors 
const getRandomItem = CMYK => CMYK.get([...CMYK.keys()][Math.floor(Math.random() * 8)])
      
const getColorKey = idx => [...CMYK.keys()][idx]


//https://erikmartinjordan.com/get-random-emoji-javascript
const getRandomEmoji = (cat = `Food & Drink`, sub) => {

  let emojis = {
      'Smileys & Emotion': {
          'face-smiling':['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','🫠','😉','😊','😇'],
          'face-affection':['🥰','😍','🤩','😘','😗','☺','😚','😙','🥲'],
          'face-tongue':['😋','😛','😜','🤪','😝','🤑'],
          'face-hand':['🤗','🤭','🫢','🫣','🤫','🤔','🫡'],
          'face-neutral-skeptical':['🤐','🤨','😐','😑','😶','🫥','😶‍🌫️','😏','😒','🙄','😬','😮‍💨','🤥'],
          'face-sleepy':['😌','😔','😪','🤤','😴'],
          'face-unwell':['😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','🥴','😵','😵‍💫','🤯'],
          'face-hat':['🤠','🥳','🥸'],
          'face-glasses':['😎','🤓','🧐'],
          'face-concerned':['😕','🫤','😟','🙁','☹','😮','😯','😲','😳','🥺','🥹','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱'],
          'face-negative':['😤','😡','😠','🤬','😈','👿','💀','☠'],
          'face-costume':['💩','🤡','👹','👺','👻','👽','👾','🤖'],
          'cat-face':['😺','😸','😹','😻','😼','😽','🙀','😿','😾'],
          'monkey-face':['🙈','🙉','🙊'],
          'emotion':['💋','💌','💘','💝','💖','💗','💓','💞','💕','💟','❣','💔','❤️‍🔥','❤️‍🩹','❤','🧡','💛','💚','💙','💜','🤎','🖤','🤍','💯','💢','💥','💫','💦','💨','🕳','💣','💬','👁️‍🗨️','🗨','🗯','💭','💤'],
      },

      'Animals & Nature': {
          'animal-mammal':['🐵','🐒','🦍','🦧','🐶','🐕','🦮','🐕‍🦺','🐩','🐺','🦊','🦝','🐱','🐈','🐈‍⬛','🦁','🐯','🐅','🐆','🐴','🐎','🦄','🦓','🦌','🦬','🐮','🐂','🐃','🐄','🐷','🐖','🐗','🐽','🐏','🐑','🐐','🐪','🐫','🦙','🦒','Browser','🐘','🦣','🦏','🦛','🐭','🐁','🐀','🐹','🐰','🐇','🐿','🦫','🦔','🦇','🐻','🐻‍❄️','🐨','🐼','🦥','🦦','🦨','🦘','🦡','🐾'],
          'animal-bird':['🦃','🐔','🐓','🐣','🐤','🐥','🐦','🐧','🕊','🦅','🦆','🦢','🦉','🦤','🪶','🦩','🦚','🦜'],
          'animal-amphibian':['🐸'],
          'animal-reptile':['🐊','🐢','🦎','🐍','🐲','🐉','🦕','🦖'],
          'animal-marine':['🐳','🐋','🐬','🦭','🐟','🐠','🐡','🦈','🐙','🐚','🪸'],
          'animal-bug':['🐌','🦋','🐛','🐜','🐝','🪲','🐞','🦗','🪳','🕷','🕸','🦂','🦟','🪰','🪱','🦠'],
          'plant-flower':['💐','🌸','💮','🪷','🏵','🌹','🥀','🌺','🌻','🌼','🌷'],
          'plant-other':['🌱','🪴','🌲','🌳','🌴','🌵','🌾','🌿','☘','🍀','🍁','🍂','🍃','🪹','🪺']
      },
      'Food & Drink': {
          'food-fruit':['🍇','🍈','🍉','🍊','🍋','🍌','🍍','🥭','🍎','🍏','🍐','🍑','🍒','🍓','🥝','🍅','🥥'],
          'food-vegetable':['🥑','🍆','🥔','🥕','🌽','🌶','🥒','🥬','🥦','🧄','🧅','🍄','🥜','🌰'],
          'food-prepared':['🍞','🥐','🥖','🥨','🥯','🥞','🧇','🧀','🍖','🍗','🥩','🥓','🍔','🍟','🍕','🌭','🥪','🌮','🌯','🥙','🧆','🥚','🍳','🥘','🍲','🥣','🥗','🍿','🧈','🧂','🥫'],
          'food-asian':['🍱','🍘','🍙','🍚','🍛','🍜','🍝','🍠','🍢','🍣','🍤','🍥','🥮','🍡','🥟','🥠','🥡'],
          'food-marine':['🦀','🦞','🦐','🦑','🦪'],
          'food-sweet':['🍦','🍧','🍨','🍩','🍪','🎂','🍰','🧁','🥧','🍫','🍬','🍭','🍮','🍯'],
          'drink':['🍼','🥛','☕','🍵','🍶','🍾','🍷','🍸','🍹','🍺','🍻','🥂','🥃','🥤','🧃','🧉','🧊'],
          'dishware':['🥢','🍽','🍴','🥄','🔪','🏺']
      },

  }

  const random = (array) => array[~~(Math.random() * array.length)]

  if(!emojis[cat])
      cat = random(Object.keys(emojis))

  if(!emojis[cat][sub])
      sub = random(Object.keys(emojis[cat]))

  return random(emojis[cat][sub])

}




const drawScoreCanvas = function(sketch){

  const padding = 20;
  const height_rec = 20;


 

  sketch.setup = function() {
    sketch.createCanvas(200, 200);

  };

  sketch.score_to_width = function(w){
    const full_score = 40;
    const full_width = 150;
  
    return Math.trunc( w /full_score * full_width) + 1
  };

  sketch.draw = function() {
    sketch.background(255);

    ppl.forEach((p, i)=>{

        let w = sketch.score_to_width(p.score);
        let s = p.id === me.id ? `Player ${p.id} (*** you're here)` : `Player ${p.id}`;
  
        sketch.fill(0);
        sketch.textSize(12)
        sketch.text(s, 0, padding * (i+1) * 2 - padding);  
        sketch.rect(0, padding * (i+1) * 2 - 15, w, height_rec);
  
        sketch.text(p.score, w + 15, padding * (i+1) * 2);  


    })
    }
    

}




let mainCanvas = new p5(drawMainCanvas, 'mainCanvas');
let scoreCanvas = new p5(drawScoreCanvas, 'scoreCanvas');