var selectedOp="", canGetNextNum=false, hasError=false;
var num=[{"digits":0,"decPoint":0,"hasDecPoint":false},{"digits":undefined,"decPoint":0,"hasDecPoint":false}];

$(document).ready(function(){
  $(".num").click(function(){
    if(!hasError){
      if(canGetNextNum) {
        clearcurrent();
        canGetNextNum=false;
      }
      if(Math.abs(num[0].digits)<Math.pow(10,14)&&num[0].decPoint<14){
        num[0].digits=num[0].digits*10 + ((num[0].digits<0) ? -parseInt(this.id) :parseInt(this.id));
        if(num[0].hasDecPoint){
          num[0].decPoint++;
          $("#screen").append(parseInt(this.id));
        }
        else $("#screen").html(num[0].digits);
      }
    }
  });
  $("#removecurrent").click(function(){
    if(!hasError) clearcurrent();
  });
  $("#clearall").click(function(){
    clearcurrent();
    $(".op").css("background-color","#afa");
    num[1].digits=undefined;
    selectedOp="";
    num[1].decPoint=0;
    num[1].hasDecPoint=false;
    hasError=false;
  });
  $("#dot").click(function(){
    if(!hasError){
      if(!num[0].hasDecPoint && Math.abs(num[0].digits)<Math.pow(10,15)){
        num[0].hasDecPoint=true;
        if(canGetNextNum){
          $("#screen").html("0.");
          canGetNextNum=false;
        }
        else $("#screen").append(".");
      }
    }
  });
  $("#changesign").click(function(){
    if(!hasError){
      if(!canGetNextNum){
        num[0].digits=-num[0].digits;
        if(num[0].hasDecPoint) $("#screen").html((num[0].digits/Math.pow(10, num[0].decPoint)).toFixed(num[0].decPoint));
        else $("#screen").html(num[0].digits);
      }
    }
  });
  $(".op").click(function(){
    if(!hasError){
      $(".op").css("background-color","#afa");
      $("#"+this.id).css("background-color","lime");
      if(!canGetNextNum){
        if(selectedOp=="") num[1]=Object.assign({},num[0]);//num[1]=num[0] lets changes to num[0] affect num[1]
        else calcAnswer();
      }
      selectedOp=this.id;
      canGetNextNum=true;
    }
  });
  $("#equals").click(function(){
    if(!hasError){
      $(".op").css("background-color","#afa");
      calcAnswer();
      selectedOp="";
      canGetNextNum=true;
    }
  });
});

function clearcurrent(){
    num[0].digits=0;
    num[0].decPoint=0;
    num[0].hasDecPoint=false;
    $("#screen").html(0);
}

function calcAnswer(){
  try{
    switch(selectedOp){
      case "subtract":
        num[0].digits=-num[0].digits;
      case "add":
        if(!num[1].hasDecPoint&&!num[0].hasDecPoint){
          num[1].digits+=num[0].digits;
          console.log(num[1].digits);
        }
        else{
          if(num[1].decPoint<num[0].decPoint){
            num[1].digits*=Math.pow(10,(num[0].decPoint-num[1].decPoint));
            num[1].decPoint=num[0].decPoint;
          }
          else num[0].digits*=Math.pow(10,(num[1].decPoint-num[0].decPoint));
          num[1].digits+=num[0].digits;
          console.log("Check if ending zeros can be shaved off")
          while(num[1].digits%10==0&&num[1].decPoint>0){
            num[1].decPoint--;
            num[1].digits%=10;
          }
          console.log((num[1].digits/Math.pow(10, num[1].decPoint)).toFixed(num[1].decPoint));
        }
        break;
      case "multiply":
        num[1].digits*=num[0].digits;
        num[1].decPoint+=num[0].decPoint;
        num[1].hasDecPoint=(num[1].hasDecPoint||num[0].hasDecPoint);
        break;
      case "divide":
        if(num[0].digits==0) throw "Division by zero";
        num[1].digits/=num[0].digits;
        num[1].decPoint-=num[0].decPoint;
        console.log("Before:");
        console.log(num[1]);
        if(num[1].digits%1==0){
          num[1].hasDecPoint=(num[1].decPoint!=0);
          console.log("Failed to detect decimal point")
        }
        else{
          if(num[1].decPoint<0){
            num[1].digits=round(num[1].digits*Math.pow(10,-num[1].decPoint),15)
            num[1].decPoint=0;
          }
          console.log("Attempt to get digits to the right of the decimal point");
          var ctr=0;
          while(((Math.pow(10,ctr)*round(num[1].digits%Math.pow(10,ctr),15))%1!=0)&&(ctr+Math.floor(Math.log10(Math.abs(num[1].digits)))+1-num[1].decPoint)<14){
            ctr++;
          }
          num[1].digits=Math.round(num[1].digits*Math.pow(10,ctr));
          num[1].decPoint+=ctr;
          console.log("After:");
          console.log(num[1]);
        }
        break;
    }
    //check if result is within allowable range
    if(Math.abs(num[1].digits/Math.pow(10,num[1].decPoint))>Math.pow(10,14)) throw "Out of range";
    else if (num[1].decPoint>0){
      var extraDigits=0;
      while((Math.floor(Math.log10(num[1].digits))-extraDigits)>14){
        extraDigits++;
        }
      num[1].digits=Math.round(num[1].digits/Math.pow(10,extraDigits));
      num[1].decPoint+=extraDigits;
	  
	  if(num[1].decPoint>14){
        num[1].digits=Math.round(num[1].digits/Math.pow(10,num[1].decPoint-14));
        num[1].decPoint=(num[1].digits==0?0:14);
	  }
	  console.log(num[1].digits%10);
	  console.log(num[1].decPoint);
	  
	  var trailingZeroes=0;
	  while((num[1].digits%Math.pow(10,trailingZeroes+1)==0)&&(trailingZeroes<num[1].decPoint)){
        trailingZeroes++;
        console.log("Extra zero shaved off");
	  }
	  num[1].digits/=Math.pow(10,trailingZeroes);
	  num[1].decPoint-=trailingZeroes;
	  
	  num[1].hasDecPoint=(num[1].decPoint>0);

    }
  }
  catch(err){
    hasError=true;
    $("#screen").html(err);
  }
  
  if(!hasError){
    if(num[1].hasDecPoint) $("#screen").html((num[1].digits/Math.pow(10, num[1].decPoint)).toFixed(num[1].decPoint));
    else $("#screen").html(num[1].digits);
  }
}

//Jack Moore's rounding function, found at http://www.jacklmoore.com/notes/rounding-in-javascript/
function round(value, decimals) { 
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}