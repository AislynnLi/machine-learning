let dcgan;
let changeAIsDone;
let changeBIsDone;

let transparent = 0;
let s;
let noiseScale = 0.02;
let direction = 1;

let amt_test = [];
let vector = [];
let random_vector = [];
let random_position = [];

let musicButton = document.getElementById('button');

let slider;
let amt;

let music_1;
let music_2;

let cam;
let poseNet;
let lastResult;

let sensitive;
let num;
let track_num;
let pattern_num;
let pattern3_num = 0;

let previousPose;
let speed;

let button_leftup = document.getElementById("leftup");
let button_leftdown = document.getElementById('leftdown');
let button_rightup = document.getElementById('rightup');
let button_rightdown = document.getElementById('rightdown');

let r;
let g;
let b;

let start_r;
let start_g;
let start_b;

let t = 0;
let ty = 0;

let kate = 0;
let sum_x = 0;
let sum_y = 0;

let rightWrist_x = 0;
let rightWrist_y = 0;
let leftWrist_x = 0;
let leftWrist_y = 0;
let nose_x = 0;
let nose_y = 0;

let spotlights = [];

let keypoints = [
  "nose",
  "rightWrist",
  "leftWrist",
  "leftElbow",
  "rightElbow",
  "leftShoulder",
  "rightShoulder",
];

function preload() {
  dcgan = ml5.DCGAN("model/SmoothedGenerator_8000_tfjs/manifest.json");
  //dcgan = ml5.DCGAN("model/new15000/manifest.json");
  music_1 = loadSound("music/blueGuy.mp3");
  music_2 = loadSound("music/comeback.mp3");
}

function setup() {
  // let canvas = createCanvas(640,480);
  // canvas.parent("canvas");
  //
  // createCanvas(640,640);
  let canvas = createCanvas(640,640);
  canvas.parent("canvas");

  background(0, 0, 0);

  start_r = random(50,222);
  start_g = random(50,222);
  start_b = random(50,222);

  for (let i = 0; i < 5; i++) {
    spotlights.push(new spotlight(width, height / 2));
  }

  track_num = random(0.35, 0.4);
  pattern_num = 3;

  // create 2 arrays to hold random values for our latent vector
  for (let i = 0; i < 128; i += 1) {
    vector[i] = random(-1, 1);
    random_vector[i] = random(-0.5, 0.5);
  }

  sensitive = random(1, 3);
  num = random(0.5, 1);
  change_num = floor(random(1, 4));

  cam = createCapture(VIDEO);
  cam.hide();

  let options = {
    flipHorizontal: true,
    detectionType: "single",
  };

  poseNet = ml5.poseNet(cam, options, modelLoaded);
}

function draw() {
  //mirror camera
  push();
  translate(width, 0);
  scale(-1, 1);
  pop();


  // background color
  r = random(255);
  g = random(255);
  b = random(255);

  // change_num
  // kate = kate + 1;
  //
  // if (kate < 1000) {
  //   pattern_num = 1;
  // } else if (kate >= 1000 && kate < 2000) {
  //   pattern_num = 2;
  // } else if (kate >= 2000 && kate < 3000) {
  //   pattern_num = 3;
  // } else if (kate >= 3000 && kate < 4000) {
  //   pattern_num = 4;
  // } else {
  //   kate = 0;
  // }

  //generate
  generate();

  if (lastResult && 0 < lastResult.length) {
    let currentPose = lastResult[0].pose;

    for (let i = 0; i < keypoints.length; i++) {
      let keypoint_name = keypoints[i];
      if (currentPose[keypoint_name]) {
        fill(55 * i, 0, 55 * i, 10);
        noStroke();

        if (previousPose && keypoint_name == "nose") {
          speed = dist(
            currentPose[keypoint_name].x,
            currentPose[keypoint_name].y,
            previousPose[keypoint_name].x,
            previousPose[keypoint_name].y
          );
          line(
            currentPose[keypoint_name].x,
            currentPose[keypoint_name].y,
            previousPose[keypoint_name].x,
            previousPose[keypoint_name].y
          );
        }

        previousPose = currentPose;

        if (keypoint_name == "rightWrist") {
          rightWrist_x = currentPose[keypoint_name].x;
          rightWrist_y = currentPose[keypoint_name].y;
        }
        if (keypoint_name == "leftWrist") {
          leftWrist_x = currentPose[keypoint_name].x;
          leftWrist_y = currentPose[keypoint_name].y;
        }
        if (keypoint_name == "nose") {
          nose_x = currentPose[keypoint_name].x;
          nose_y = currentPose[keypoint_name].y;
        }

        let x = num;
        let y = num;
        if (currentPose[keypoint_name].confidence > 0.6) {
          x = map(currentPose[keypoint_name].x, 100, 540, -1, 1) * sensitive;
          x = constrain(x, -1, 1);
          y = map(currentPose[keypoint_name].y, 100, 540, -1, 1) * sensitive;
          y = constrain(y, -1, 1);
        }

        if (change_num == "1") {
          for (let j = 0; j < 128; j += 2) {
            if ((j % keypoints.length) * 2 == i * 2) {
              vector[j] = vector[j] * 0.65 + x * 0.25+ random_vector[j]*0.1;
              vector[j + 1] = vector[j + 1] * 0.65 + y * 0.25 + random_vector[j]*0.1;
            }
          }
        }

        if (change_num == "2") {
          for (let j = 0; j < 128; j += 2) {
            if ((j % keypoints.length) * 2 == (i + 1) * 2) {
              vector[j] = vector[j] * 0.65 + x * 0.25+ random_vector[j]*0.1;
              vector[j + 1] = vector[j + 1] * 0.65 + y * 0.25 + random_vector[j]*0.1;
            }
          }
        }

        if (change_num == "3") {
          for (let j = 0; j < 128; j += 2) {
            if ((j % keypoints.length) * 2 == (i + 2) * 2) {
              vector[j] = vector[j] * 0.65 + x * 0.25+ random_vector[j]*0.1;
              vector[j + 1] = vector[j + 1] * 0.65 + y * 0.25 + random_vector[j]*0.1;
            }
          }
        }
      }
    }

    if(mouseIsPressed){
    button_rightup.style.boxShadow = "0px 0px 30px Magenta";
    button_rightup.style.background = "radial-gradient(yellow, purple)";
    button_rightup.style.borderColor = "purple"
  }

  if(musicButton.checked == false && music_1.isPlaying() == true){
    music_1.stop();
  }

  if(musicButton.checked && music_1.isPlaying() == false){
    music_1.play();
  }
    // push();
    // fill(255,255,255);
    // rect(0,0,windowWidth/2-320,windowHeight);
    // rect(windowWidth/2+320,0,windowWidth/2-320,windowHeight);
    // rect(0,windowHeight/2+320,windowWidth,windowHeight/2-320);
    // rect(0,0,windowWidth,windowHeight/2-320);
    //
    // fill(255,0,0);
    // rect(windowWidth/2-600,windowHeight/2-250,150,150);
    // rect(windowWidth/2-600,windowHeight/2+100,150,150);
    // rect(windowWidth/2+450,windowHeight/2-250,150,150);
    // rect(windowWidth/2+450,windowHeight/2+100,150,150);
    // pop();

    if( dist(leftWrist_x,leftWrist_y,-20,100)<40){
      pattern_num = 1;
      button_leftup.style.boxShadow = "0px 0px 30px Magenta";
      button_leftup.style.background = "radial-gradient(yellow, purple)";
      button_leftup.style.borderColor = "purple"

      button_leftdown.style.boxShadow = "0px 0px 0px Magenta";
      button_leftdown.style.background = "radial-gradient(blue, purple)";
      button_leftdown.style.borderColor = "blue"
      button_rightup.style.boxShadow = "0px 0px 0px Magenta";
      button_rightup.style.background = "radial-gradient(blue, purple)";
      button_rightup.style.borderColor = "blue"
      button_rightdown.style.boxShadow = "0px 0px 0px Magenta";
      button_rightdown.style.background = "radial-gradient(blue, purple)";
      button_rightdown.style.borderColor = "blue"
    }
    if( dist(leftWrist_x,leftWrist_y,-25,520)<25){
      pattern_num = 2;
      button_leftdown.style.boxShadow = "0px 0px 30px Magenta";
      button_leftdown.style.background = "radial-gradient(yellow, purple)";
      button_leftdown.style.borderColor = "purple"

      button_leftup.style.boxShadow = "0px 0px 0px Magenta";
      button_leftup.style.background = "radial-gradient(blue, purple)";
      button_leftup.style.borderColor = "blue"
      button_rightup.style.boxShadow = "0px 0px 0px Magenta";
      button_rightup.style.background = "radial-gradient(blue, purple)";
      button_rightup.style.borderColor = "blue"
      button_rightdown.style.boxShadow = "0px 0px 0px Magenta";
      button_rightdown.style.background = "radial-gradient(blue, purple)";
      button_rightdown.style.borderColor = "blue"
    }
    if( dist(rightWrist_x,rightWrist_y,620,100)<40){
      pattern_num = 3;
      button_rightup.style.boxShadow = "0px 0px 30px Magenta";
      button_rightup.style.background = "radial-gradient(yellow, purple)";
      button_rightup.style.borderColor = "purple"

      button_leftup.style.boxShadow = "0px 0px 0px Magenta";
      button_leftup.style.background = "radial-gradient(blue, purple)";
      button_leftup.style.borderColor = "blue"
      button_leftdown.style.boxShadow = "0px 0px 0px Magenta";
      button_leftdown.style.background = "radial-gradient(blue, purple)";
      button_leftdown.style.borderColor = "blue"
      button_rightdown.style.boxShadow = "0px 0px 0px Magenta";
      button_rightdown.style.background = "radial-gradient(blue, purple)";
      button_rightdown.style.borderColor = "blue"
    }
    if( dist(rightWrist_x,rightWrist_y,620,520)<30){
      pattern_num = 4;
      button_rightdown.style.boxShadow = "0px 0px 30px Magenta";
      button_rightdown.style.background = "radial-gradient(yellow, purple)";
      button_rightdown.style.borderColor = "purple"

      button_leftup.style.boxShadow = "0px 0px 0px Magenta";
      button_leftup.style.background = "radial-gradient(blue, purple)";
      button_leftup.style.borderColor = "blue"
      button_leftdown.style.boxShadow = "0px 0px 0px Magenta";
      button_leftdown.style.background = "radial-gradient(blue, purple)";
      button_leftdown.style.borderColor = "blue"
      button_rightup.style.boxShadow = "0px 0px 0px Magenta";
      button_rightup.style.background = "radial-gradient(blue, purple)";
      button_rightup.style.borderColor = "blue"
    }

    let Min = min(dist(leftWrist_x,leftWrist_y,0,150),dist(leftWrist_x,leftWrist_y,0,450),dist(rightWrist_x,rightWrist_y,640,150),dist(rightWrist_x,rightWrist_y,640,450))





  }

  if (pattern_num == 4) {
    for (let i = 0; i < spotlights.length; i++) {
      spotlights[i].update();
      spotlights[i].display();
    }
  }
}

function generate() {
  dcgan.generate(displayImage, vector);
}

function displayImage(err, result) {
  if (err) {
    console.log(err);
    return;
  }

  pattern();

  // image
  push();
  tint(start_r,start_g,start_b);
  image(result.image, width / 2-160, height / 2-160, 320, 320);
  //filter(THRESHOLD);
  pop();
}

function pattern() {
  // 1
  if (pattern_num == 1) {
    tint(r, g, b);

    let angle = radians(frameCount * 0.5);

    // red square
    s = frameCount;
    push();
    translate(width / 2, height / 2);
    rotate(radians(frameCount * 0.01));
    noFill();
    rectMode(CENTER);
    stroke(255, 0, 0);
    translate(30, 30);
    rotate(radians(frameCount * 3));
    rect(rightWrist_x / 10, rightWrist_y / 10, rightWrist_x, rightWrist_x);
    rotate(radians(frameCount * -4));
    strokeWeight(10);
    stroke(255, 0, 0, 100);
    line(-rightWrist_x, -rightWrist_y, rightWrist_x, rightWrist_x);
    line(-rightWrist_x, -rightWrist_y, rightWrist_y, rightWrist_y);

    pop();
    if (s % 5 == 0) {
      fill(0, 0, 0, 125);
      rect(0, 0, width, height);
    }

    // blue triangle
    push();
    translate(width / 2, height / 2);
    rotate(radians(frameCount * -2));
    noFill();
    stroke(0, 0, 255);
    triangle(
      0,
      25 * leftWrist_x,
      -25 * leftWrist_x,
      -25 * leftWrist_y,
      25 * leftWrist_y,
      -25 * leftWrist_x
    );
    pop();

    // yellow circles
    push();
    let spin = 360 / 6;

    translate(width / 2, height / 2);
    angleMode(DEGREES);

    let mx = leftWrist_x - width / 2;
    let my = leftWrist_y - height / 2;

    for (let i = 0; i < 6; i++) {
      rotate(spin);
      rotate(frameCount);

      fill(255, 255, 0, 10);
      strokeWeight(3);
      ellipse(mx, mx, mx, my);
      push();
      scale(1, -1);
      noFill();
      ellipse(my, my, mx, my);
      pop();
    }
    angleMode(RADIANS);
    pop();

    pattern3_num = 0;
  }

  if (pattern_num == 2) {
    tint(255, 20);
    fill(0, 0, 0, 10);
    rect(0, 0, width, height);
    pattern3_num = 0;
  }

  if (pattern_num == 3) {
    tint(255, 255);
    display_track();

    if(pattern3_num < 10){
      fill(0, 0, 0);
      rect(0, 0, width, height);
      pattern3_num ++;
    }

  }

  if (pattern_num == 4) {
    fill(0);
    rect(0, 0, width, height);
    pattern3_num = 0;
  }
}

class spotlight {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = random(3, 7);
    this.start = random(0, 500);
    this.spot = random(0, 640);
    this.light_width = random(width / 5, width / 2);

    this.x = this.start;
    this.light = random(50, 150);

    this.change_speed = 0.6;
    this.change = random(0.005, 0.015);

    this.r = random(255);
    this.g = random(255);
    this.b = random(255);
  }

  update() {
    this.x = this.x + this.speed * this.change_speed;

    this.change_speed = this.change_speed + this.change;

    if (this.change_speed > 2 || this.change_speed < 0.4) {
      this.change = this.change * -1;
    }

    if (
      this.x < this.start - this.light_width ||
      this.x > this.start + this.light_width - 10
    ) {
      this.speed = this.speed * -1;
    }
  }

  display() {
    fill(this.r, this.g, this.b, 40);
    beginShape();
    vertex(this.spot, 0);
    vertex(this.x + this.light, (3 * height) / 4);
    vertex(this.x, (3 * height) / 4);
    endShape(CLOSE);
  }
}

function display_track() {
  sum_x = 0;
  sum_y = 0;
  for (let i = 0; i < 128; i += 2) {
    sum_x += vector[i];
    sum_y += vector[i + 1];
  }

  let avg_x = sum_x / 128;
  let avg_y = sum_y / 128;

  avg_x = map(avg_x, 0, track_num, 0, 640);
  avg_y = map(avg_y, 0, track_num, 0, 640);

  speed = map(speed, 0, 50, 1, 1.5);
  speed = constrain(speed, 1, 1.5);
  fill(r, g, b, 10);
  if (
    width / 4 < avg_x &&
    (3 * width) / 4 > avg_x &&
    width / 4 < avg_y &&
    (3 * width) / 4 > avg_y
  ) {
  } else {
    ellipse(avg_x, avg_y, speed * 100, speed * 100);
  }
}

function modelLoaded() {
  console.log("Model loaded");
  poseNet.on("pose", finishedDetecting);
}

function finishedDetecting(result) {
  //console.log(result);
  lastResult = result;
}

// let musicButton = document.getElementById('button');
// console.log(musicButton.checked)
//
// if(musicButton.checked == false && music_1.isPlaying() == true){
//   music_1.stop();
// }
//
// if(musicButton.checked){
//   music_1.play();
// }


musicButton.addEventListener('boolean', clickFunctionMusic);

function clickFunctionMusic() {
  if (music_1.isPlaying() == false) {
  music_1.play();
}
}
