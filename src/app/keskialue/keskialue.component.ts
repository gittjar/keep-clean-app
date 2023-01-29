import { Component } from '@angular/core';
import { timer, interval } from 'rxjs';



@Component({
  selector: 'app-keskialue',
  templateUrl: './keskialue.component.html',
  styleUrls: ['./keskialue.component.css']
})
export class KeskialueComponent {

 


  toiletId = '1.44';
  toiletName = 'Terminal 1 / M / Basement';
  toiletLocation = 'Helsinki-Vantaa Airport'
  timeSet: number = 0;
  interval: any;
 // halfTime: number = 30;
  color1: string = '#06E703';
  overTimeText: string | undefined;

 


  startTimer() {
    this.interval = setInterval(() => {
      if(this.timeSet < 72) {
        this.timeSet++;
      } else {
        //this.timeSet = 0;
        this.pauseTimer();
      }
      if(this.timeSet > 1){
        this.color1 = '#18E703';
      }
      if(this.timeSet > 2){
        this.color1 = '#37E703';
      }
      if(this.timeSet > 3){
        this.color1 = '#59E703';
      }
      if(this.timeSet > 4){
        this.color1 = '#8AE703';
      }
      if(this.timeSet > 5){
        this.color1 = '#A9E703';
      }
      if(this.timeSet > 6){
        this.color1 = '#E7E703';
      }
      if(this.timeSet > 7){
        this.color1 = '#E7C103';
      }
      if(this.timeSet > 8){
        this.color1 = '#E79E03';
      }
      if(this.timeSet > 9){
        this.color1 = '#E77803';
      }
      if(this.timeSet > 10){
        this.color1 = '#E75D03';
      }
      if(this.timeSet > 11){
        this.color1 = '#E73E03';
      }
      if(this.timeSet > 12){
        this.color1 = '#E72203';
      }
      if(this.timeSet > 13){
        this.overTimeText = 'Last clean up was done, more than our service promise!';
      }


    },500) // interval 1000 = 1s, for demo 2500 per one = 2,5s
  }
  pauseTimer() {
    clearInterval(this.interval);
  }



  resetTimer() {
    this.timeSet = 0;
    this.color1 = '#06E703';
    this.overTimeText = '';
  }

  


}


  /*
  timeLeft: number = 60;
  interval: any;
 // halfTime: number = 30;

  color1: string = '#fb8857';
  startTimer() {
    this.interval = setInterval(() => {
      if(this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.timeLeft = 60;
      }
      if(this.timeLeft < 30){
        this.color1 = 'yellow';
      }

    },1000)
  }
  pauseTimer() {
    clearInterval(this.interval);
  }

  resetTimer() {
    this.timeLeft = 60;
    this.color1 = '#fb8857';
  }
  */

