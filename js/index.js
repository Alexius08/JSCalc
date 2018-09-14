let selectedOp="", canGetNextNum=false, hasError=false;

class num{
  constructor(){
    this.reset();
  }
  reset() {
    this.digits = 0;
    this.decPoint = 0;
    this.hasDecPoint = false;
  }
}

let operand = [new num(), new num()];

const screen = document.getElementById("screen");
const operators = document.getElementsByClassName("op");
const numbers = document.getElementsByClassName("num");

document.getElementById("removecurrent").addEventListener("click", () => {
  if(!hasError)
    clearcurrent();
});

document.getElementById("clearall").addEventListener("click", () => {
  clearcurrent();
  Array.from(operators, o => o.style.backgroundColor = "#afa");
  operand[1].reset();
  selectedOp="";
  hasError=false;
});

document.getElementById("dot").addEventListener("click", () => {
    if(!hasError){
      if(!operand[0].hasDecPoint && Math.abs(operand[0].digits)<10**15){
        operand[0].hasDecPoint=true;
        if(canGetNextNum){
          screen.innerHTML = "0.";
          canGetNextNum=false;
        }
        else screen.innerHTML += ".";
      }
    }
});

document.getElementById("changesign").addEventListener("click", () => {
  if(!hasError){
    if(!canGetNextNum){
      operand[0].digits *= -1;
      screen.innerHTML = operand[0].hasDecPoint ? operand[0].digits/(10** operand[0].decPoint).toFixed(operand[0].decPoint) : operand[0].digits;
    }
  }
});

document.getElementById("equals").addEventListener("click", () => {
  if(!hasError){
    Array.from(operators, o => o.style.backgroundColor = "#afa");
    calcAnswer();
    selectedOp="";
    canGetNextNum=true;
  }
});

let operate = function(){
  if(!hasError){
    Array.from(operators, o => o.style.backgroundColor = "#afa");
    document.getElementById(this.id).style.backgroundColor = "Lime";
    if(!canGetNextNum){
      if(selectedOp=="")
        operand[1] = Object.assign({},operand[0]);//operand[1]=operand[0] lets changes to operand[0] affect operand[1]
      else
        calcAnswer();
    }
    selectedOp = this.id;
    canGetNextNum = true;
  }
};

Array.from(operators, o => o.addEventListener("click", operate));

let digit = function(){
  if(!hasError){
    if(canGetNextNum) {
      clearcurrent();
      canGetNextNum=false;
    }
    if(Math.abs(operand[0].digits)<10**14&&operand[0].decPoint<14){
      operand[0].digits = operand[0].digits*10 + ((operand[0].digits<0) ? -parseInt(this.id) : parseInt(this.id));
      if(operand[0].hasDecPoint){
        operand[0].decPoint++;
        screen.innerHTML += parseInt(this.id);
      }
      else
        screen.innerHTML = operand[0].digits;
    }
  }
};

Array.from(numbers, d => d.addEventListener("click", digit));

function clearcurrent(){
  operand[0].reset();
  screen.innerHTML = 0;
}

function calcAnswer(){
  try{
    switch(selectedOp){
      case "subtract":
        operand[0].digits *= -1;
      case "add":
        if(!operand[1].hasDecPoint&&!operand[0].hasDecPoint){
          operand[1].digits += operand[0].digits;
          console.log(operand[1].digits);
        }
        else{
          if(operand[1].decPoint < operand[0].decPoint){
            operand[1].digits *= (10**(operand[0].decPoint-operand[1].decPoint));
            operand[1].decPoint = operand[0].decPoint;
          }
          else operand[0].digits *= (10 **(operand[1].decPoint-operand[0].decPoint));
          operand[1].digits += operand[0].digits;
          console.log("Check if ending zeros can be shaved off")
          while(operand[1].digits%10 == 0 && operand[1].decPoint>0){
            operand[1].decPoint--;
            operand[1].digits %= 10;
          }
          console.log((operand[1].digits/(10 ** operand[1].decPoint)).toFixed(operand[1].decPoint));
        }
        break;
      case "multiply":
        operand[1].digits *= operand[0].digits;
        operand[1].decPoint += operand[0].decPoint;
        operand[1].hasDecPoint = (operand[1].hasDecPoint||operand[0].hasDecPoint);
        break;
      case "divide":
        if(operand[0].digits==0) throw "Division by zero";
        operand[1].digits /= operand[0].digits;
        operand[1].decPoint -= operand[0].decPoint;
        console.log("Before:");
        console.log(operand[1]);
        if(operand[1].digits % 1 == 0){
          operand[1].hasDecPoint = (operand[1].decPoint != 0);
          console.log("Failed to detect decimal point")
        }
        else{
          if(operand[1].decPoint<0){
            operand[1] = {
              digits: round(operand[1].digits*(10 ** -operand[1].decPoint),15),
              decPoint: 0
            }
          }
          console.log("Attempt to get digits to the right of the decimal point");
          let ctr = 0;
          while(((10**ctr * round(operand[1].digits% 10**ctr ,15))%1!=0)&&(ctr+Math.floor(Math.log10(Math.abs(operand[1].digits)))+1-operand[1].decPoint)<14){
            ctr++;
          }
          operand[1].digits = Math.round(operand[1].digits * 10 ** ctr);
          operand[1].decPoint += ctr;
          console.log("After:");
          console.log(operand[1]);
        }
        break;
    }
    //check if result is within allowable range
    if(Math.abs(operand[1].digits/(10**operand[1].decPoint))>10**14)
      throw "Out of range";
    else if (operand[1].decPoint>0){
      let extraDigits=0;
      while((Math.floor(Math.log10(operand[1].digits))-extraDigits)>14){
        extraDigits++;
        }
      operand[1].digits = Math.round(operand[1].digits/10**extraDigits);
      operand[1].decPoint += extraDigits;
	  
	  if(operand[1].decPoint>14){
      operand[1] = {
        digits: Math.round(operand[1].digits/(10**operand[1].decPoint-14)),
        decPoint: operand[1].digits==0?0:14
      }
	  }
	  console.log(operand[1].digits%10);
	  console.log(operand[1].decPoint);
	  
	  let trailingZeroes=0;
	  while((operand[1].digits%(10**(trailingZeroes+1))==0)&&(trailingZeroes<operand[1].decPoint)){
        trailingZeroes++;
        console.log("Extra zero shaved off");
	  }
	  operand[1].digits /= 10**trailingZeroes;
	  operand[1].decPoint -= trailingZeroes;
	  
	  operand[1].hasDecPoint = operand[1].decPoint>0;
    }
  }
  catch(err){
    hasError=true;
    screen.innerHTML = err;
  }
  
  if(!hasError){
    screen.innerHTML = operand[1].hasDecPoint ? (operand[1].digits/10 ** operand[1].decPoint).toFixed(operand[1].decPoint) : operand[1].digits;
  }
}

//Jack Moore's rounding function, found at http://www.jacklmoore.com/notes/rounding-in-javascript/
function round(value, decimals) { 
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}