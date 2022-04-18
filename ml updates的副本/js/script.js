let cam;
let poseNet;
let lastResult;

let opacity = 0;
let save = false;
let realtime = true;
let score = 0;

let image1 = document.getElementById('image1');
let image2 = document.getElementById('julie');
let image3 = document.getElementById('amusement');
let image4 = document.getElementById('drama');
let image5 = document.getElementById('image5');
let image6 = document.getElementById('image6');

let instruction_tiya = document.getElementById('in_tiya');
let instruction_julie = document.getElementById('in_julie');
let instruction_jane = document.getElementById('in_jane');
let instruction_drama = document.getElementById('in_drama');
let instruction_kicking = document.getElementById('in_kicking');
let instruction_amusement = document.getElementById('in_amusement');
let instruction_none = document.getElementById('in_none');

let result_tiya = document.getElementById('result_tiya');
let result_julie = document.getElementById('result_julie');
let result_jane = document.getElementById('result_jane');
let result_drama = document.getElementById('result_drama');
let result_kicking = document.getElementById('result_kicking');
let result_amusement = document.getElementById('result_amusement');


let border_tiya = document.getElementById('media_1');
let border_julie = document.getElementById('media_2');
let border_jane = document.getElementById('five');
let border_drama = document.getElementById('four');
let border_kicking = document.getElementById('six');
let border_amusement = document.getElementById('media_3');

let score1;
let score2;
let score3;
let score4;
let score5;
let score6;


let grey = 0;
let scores = [];

//image information
let images = [
  {
    fn: "kicking",
    nose: { x: 308.5706681312988, y: 135.94022345671806 },
    leftElbow: { x: 224.96432779355746, y: 215.42387041817597 },
    rightElbow: { x: 233.17496232570102, y: 320.09894918651935 },
    leftWrist: { x: 296.49470568873016, y: 127.73347889985484 },
    rightWrist: { x: 142.25492229818565, y: 365.4881517945603 },
  },

  {
    fn: "drama",
    nose: {
      x: 279.65981763415425,
      y: 106.81928268440544,
      confidence: 0.14484763145446777,
    },
    leftShoulder: {
      x: 426.8549925552336,
      y: 149.93748137063642,
      confidence: 0.8873509764671326,
    },
    rightShoulder: {
      x: 311.61619817690143,
      y: 132.86084859733023,
      confidence: 0.9135830402374268,
    },
    leftElbow: {
      x: 245.65382370581995,
      y: 127.86593566069735,
      confidence: 0.8643878698348999,
    },
    rightElbow: {
     x: 422.5191745440826,
      y: 276.01943799215144,
      confidence: 0.8031222820281982,
    },
    leftWrist: {
      x: 313.8710620794871,
      y: 54.05775145532687,
      confidence: 0.9580063223838806,
    },
    rightWrist: {
      x: 418.79682016670085,
      y: 402.8231851494485,
      confidence: 0.10696630924940109,
    },
  },

  {
    fn: "julie",
    nose: { x: 239.25510628618966, y: 73.594123017436 },
    leftElbow: { x: 66.85975918902678, y: 338.83160863547215 },
    rightElbow: { x: 377.9590735091687, y: 272.95808064609463 },
    leftWrist: { x: 9.95335272584784, y: 457.9474361478366 },
    rightWrist: { x: 311.7718770658053, y: 168.83770564469876 },
  },
  {
  fn:"jane",
  nose: { x: 369.903252891493, y: 239.12475964710774 },
    leftElbow: { x: 301.56964653757655, y: 171.41904116688056 },
    rightElbow: { x: 397.3188432150224, y: 257.02938218780963 },
    leftWrist: { x: 302.8358300968415, y: 107.42921335216371 },
    rightWrist: { x: 360.5071817441691, y: 197.3666413812776 },
  },
  {
  fn:"tiya",
  nose: { x: 308.56444277218134, y: 85.41070818990283 },
    leftElbow: { x: 111.46555064116103, y: 408.13136114330666 },
    rightElbow: { x: 425.1574359243476, y: 404.4285757354294 },
    leftWrist: { x: 120.69739616854031, y: 286.460598101388 },
    rightWrist: { x: 456.0472566949603, y: 282.4796107286228 },
  },
  {
    fn:"amusement",
    nose: { x: 347.9541927358588, y: 185.43708126163256 },
    leftElbow: { x: 188.13215704221966, y: 205.9517593919113 },
    rightElbow: { x: 448.11293051371706, y: 308.5538586189741 },
    leftWrist: { x: 109.29494978930484, y: 194.860800364409 },
    rightWrist: { x: 492.2620703690761, y: 380.36394248881106 },
  },
];

let keypoints = [
  "nose",
  "leftElbow",
  "rightElbow",
  "leftWrist",
  "rightWrist",
];

let savedPosition = [];
let currentPosition = [];

function setup() {
  let canvas = createCanvas(640,480);
  canvas.parent("canvas");

  cam = createCapture(VIDEO);
  cam.hide();

  frameRate(15);

  let options = {
    flipHorizontal: true,
    detectionType: "single",
  };

  poseNet = ml5.poseNet(cam, options, modelLoaded);
}

function draw() {
  background(0, 0, 0);

  //mirror camera
  push();
  translate(width, 0);
  scale(-1, 1);
  image(cam, 0, 0);
  pop();

  // DEBUG: draw the saved poses
  // colorMode(HSB);
  // for (let i=0; i < images.length; i++) {
  //   let image = images[i];
  //   for (let j=0; j < keypoints.length; j++) {
  //     let keypoint_name = keypoints[j];
  //     fill((i * 100) % 255, 100, 100);
  //     ellipse(image[keypoint_name].x, image[keypoint_name].y, 5, 5);
  //   }
  // }
  // colorMode(RGB);

  if (lastResult && 0 < lastResult.length) {
    let currentPose = lastResult[0].pose;

    // DEBUG: draw the current pose
    for (let i = 0; i < keypoints.length; i++) {
      let keypoint_name = keypoints[i];

      // if the keypoint exists in the current pose, draw it
      if (currentPose[keypoint_name]) {
        fill(255);
        //ellipse(currentPose[keypoint_name].x, currentPose[keypoint_name].y, 5, 5);
      }
    }

    // for each image
    for (let i = 0; i < images.length; i++) {
      let image = images[i];

      // calculate the error

      // step 1. figure out the sum of the difference in x and y

      sum_dx = 0;
      sum_dy = 0;
      num_dx_dy = 0;

      let sum_confidence = 0;

      // for each keypoint ("nose", etc)
      for (let j = 0; j < keypoints.length; j++) {
        let keypoint_name = keypoints[j];

        // figure out the difference in position
        // if the keypoint exists in the current pose, add the delta to the sum
        if (currentPose[keypoint_name]) {
          sum_dx += image[keypoint_name].x - currentPose[keypoint_name].x;
          sum_dy += image[keypoint_name].y - currentPose[keypoint_name].y;
          num_dx_dy++;

          sum_confidence += currentPose[keypoint_name].confidence;
        }
      }

      // step 2. calculate the average difference in x and y

      avg_dx = sum_dx / num_dx_dy;
      avg_dy = sum_dy / num_dx_dy;

      avg_confidence = sum_confidence/num_dx_dy;

      // step 3. calculate the error taking into account this average shift of points

      let error = 0;
      let score = 0;

      // for each keypoint ("nose", etc)
      for (let j = 0; j < keypoints.length; j++) {
        let keypoint_name = keypoints[j];

        if (currentPose[keypoint_name]) {
          // keypoint exists in current pose
          error += abs(
            avg_dx - (image[keypoint_name].x - currentPose[keypoint_name].x)
          );
          error += abs(
            avg_dy - (image[keypoint_name].y - currentPose[keypoint_name].y)
          );
        } else {
          // keypoint doesn't exist, add some arbitary error
          error += 100;
        }

      let scale_x = map(abs(avg_dx),10,250,1,0.95);
      let scale_y = map(abs(avg_dy),10,250,1,0.95);
      error = error*scale_x*scale_y;

      }

      if(i == 4){
        image1.style.filter = "blur(10px)";
        score = map(error,250,600,100,0);
        score = constrain(score, 0,100);
        score = floor(score);
        score5 = score;
        document.getElementById("error1").innerHTML = "“Low Double Scissor Hands”" + "<br>" + score + " %" ;

        let blur_score = map(score,0,100,8,0);
        image1.style.filter = "blur("+blur_score+"px)";

        if(score >= 92 && score <= 100){
        result_tiya.style.opacity = "100%";
        result_tiya.style.transition = "opacity 1.5s ease-in-out";
        result_amusement.style.opacity = "0%";
        result_jane.style.opacity = "0%";
        result_drama.style.opacity = "0%";
        result_kicking.style.opacity = "0%";
        result_julie.style.opacity = "0%";
      } else {
        result_tiya.style.opacity = "0%";
        result_tiya.style.transition = "opacity 1.5s ease-in-out";
      }

      }

      if(i == 0){
        score = map(error,430,700,100,0);
        score = constrain(score, 0,100);
        score = floor(score);
        score1 = score;
        document.getElementById("error6").innerHTML = "“Two-handed Blocking in Parallel”" + "<br>" + score + " %";

        let blur_score = map(score,0,100,8,0);
        image6.style.filter = "blur("+blur_score+"px)";


        if(score >= 92 && score <= 100){
        result_kicking.style.opacity = "100%";
        result_kicking.style.transition = "opacity 1.5s ease-in-out";
        result_amusement.style.opacity = "0%";
        result_jane.style.opacity = "0%";
        result_drama.style.opacity = "0%";
        result_tiya.style.opacity = "0%";
        result_julie.style.opacity = "0%";
      } else {
        result_kicking.style.opacity = "0%";
        result_kicking.style.transition = "opacity 1.5s ease-in-out";
      }
      }

      if(i == 1){
        score = map(error,430,900,100,0);
        score = constrain(score, 0,100);
        score = floor(score);
        score2 = score;
        document.getElementById("error4").innerHTML = "“Left-handed Salute”" + "<br>" + score + " %";
        let blur_score = map(score,0,100,10,0);
        image4.style.filter = "blur("+blur_score+"px)";


        if(score >= 92 && score <= 100){
        result_drama.style.opacity = "100%";
        result_drama.style.transition = "opacity 1.5s ease-in-out";
        result_amusement.style.opacity = "0%";
        result_jane.style.opacity = "0%";
        result_tiya.style.opacity = "0%";
        result_kicking.style.opacity = "0%";
        result_julie.style.opacity = "0%";
      } else {
        result_drama.style.opacity = "0%";
        result_drama.style.transition = "opacity 1.5s ease-in-out";
      }
      }

      if(i == 2){
         score = map(error,350,600,100,0);
         score = constrain(score, 0,100);
         score = floor(score);
         score3 = score;
         let blur_score = map(score,0,100,14,0);
         document.getElementById("error2").innerHTML = "“Toothache”" + "<br>" + score + " %";
         image2.style.filter = "blur("+blur_score+"px)";


         if(score >= 92 && score <= 100){
         result_julie.style.opacity = "100%";
         result_julie.style.transition = "opacity 1.5s ease-in-out";
         result_amusement.style.opacity = "0%";
         result_jane.style.opacity = "0%";
         result_drama.style.opacity = "0%";
         result_kicking.style.opacity = "0%";
         result_tiya.style.opacity = "0%";
       } else {
         result_julie.style.opacity = "0%";
         result_julie.style.transition = "opacity 1.5s ease-in-out";
       }


      }
      if(i == 3){
        score = map(error,350,600,100,0);
        score = constrain(score, 0,100);
        score = floor(score);
        score4 = score;
        let blur_score = map(score,0,100,8,0);
        document.getElementById("error5").innerHTML = "“Shooting(Basketball)”" + "<br>" + score + " %";
        image5.style.filter = "blur("+blur_score+"px)";


        if(score >= 92 && score <= 100){
        result_jane.style.opacity = "100%";
        result_jane.style.transition = "opacity 1.5s ease-in-out";
        result_amusement.style.opacity = "0%";
        result_tiya.style.opacity = "0%";
        result_drama.style.opacity = "0%";
        result_kicking.style.opacity = "0%";
        result_julie.style.opacity = "0%";
      } else {
        result_jane.style.opacity = "0%";
        result_jane.style.transition = "opacity 1.5s ease-in-out";
      }
      }

      if(i == 5){
        score = map(error,350,800,100,0);
        score = constrain(score, 0,100);
        score = floor(score);
        score6 = score;
        let blur_score = map(score,0,100,8,0);
        document.getElementById("error3").innerHTML = "“Imitation Of Side-flying Aircraft”" + "<br>" + score + " %";
        image3.style.filter = "blur("+blur_score+"px)";


        if(score >= 92 && score <= 100){
        result_amusement.style.opacity = "100%";
        result_amusement.style.transition = "opacity 1.5s ease-in-out";
        result_tiya.style.opacity = "0%";
        result_jane.style.opacity = "0%";
        result_drama.style.opacity = "0%";
        result_kicking.style.opacity = "0%";
        result_julie.style.opacity = "0%";
      } else {
        result_amusement.style.opacity = "0%";
        result_amusement.style.transition = "opacity 1.5s ease-in-out";
      }
      }

    }
  }
  scoreMax = max(score1,score2,score3,score4,score5,score6);
  let grey_scale = map(scoreMax,0,100,100,0);
  canvas.style.filter = "grayscale("+grey_scale+"%)";

  if(scoreMax == score5 && scoreMax>20){
    border_tiya.style.border = "10px ridge #FFA500";
    border_julie.style.border = "10px ridge #FFFFFF";
    border_amusement.style.border = "10px ridge #FFFFFF";
    border_drama.style.border = "10px ridge #FFFFFF";
    border_jane.style.border = "10px ridge #FFFFFF";
    border_kicking.style.border = "10px ridge #FFFFFF";
  }
  else if(scoreMax == score3 && scoreMax>20){
    border_julie.style.border = "10px ridge #FFA500";
    border_amusement.style.border = "10px ridge #FFFFFF";
    border_tiya.style.border = "10px ridge #FFFFFF";
    border_drama.style.border = "10px ridge #FFFFFF";
    border_jane.style.border = "10px ridge #FFFFFF";
    border_kicking.style.border = "10px ridge #FFFFFF";
  }
  else if(scoreMax == score6 && scoreMax>20){
    border_amusement.style.border = "10px ridge #FFA500";
    border_julie.style.border = "10px ridge #FFFFFF";
    border_tiya.style.border = "10px ridge #FFFFFF";
    border_drama.style.border = "10px ridge #FFFFFF";
    border_jane.style.border = "10px ridge #FFFFFF";
    border_kicking.style.border = "10px ridge #FFFFFF";
  }
  else if(scoreMax == score2 && scoreMax>20){
    border_drama.style.border = "10px ridge #FFA500";
    border_julie.style.border = "10px ridge #FFFFFF";
    border_tiya.style.border = "10px ridge #FFFFFF";
    border_amusement.style.border = "10px ridge #FFFFFF";
    border_jane.style.border = "10px ridge #FFFFFF";
    border_kicking.style.border = "10px ridge #FFFFFF";
  }
  else if(scoreMax == score4 && scoreMax>20){
    border_jane.style.border = "10px ridge #FFA500";
    border_julie.style.border = "10px ridge #FFFFFF";
    border_tiya.style.border = "10px ridge #FFFFFF";
    border_drama.style.border = "10px ridge #FFFFFF";
    border_amusement.style.border = "10px ridge #FFFFFF";
    border_kicking.style.border = "10px ridge #FFFFFF";
  }
  else if(scoreMax == score1 && scoreMax>20){
    border_kicking.style.border = "10px ridge #FFA500";
    border_julie.style.border = "10px ridge #FFFFFF";
    border_amusement.style.border = "10px ridge #FFFFFF";
    border_drama.style.border = "10px ridge #FFFFFF";
    border_jane.style.border = "10px ridge #FFFFFF";
    border_tiya.style.border = "10px ridge #FFFFFF";
  }
  else if(scoreMax<20){
    border_kicking.style.border = "10px ridge #FFFFFF";
    border_julie.style.border = "10px ridge #FFFFFF";
    border_amusement.style.border = "10px ridge #FFFFFF";
    border_drama.style.border = "10px ridge #FFFFFF";
    border_jane.style.border = "10px ridge #FFFFFF";
    border_tiya.style.border = "10px ridge #FFFFFF";
  }
}

function modelLoaded() {
  console.log("Model loaded");
  poseNet.on("pose", finishedDetecting);
}

function finishedDetecting(result) {
  lastResult = result;
}
