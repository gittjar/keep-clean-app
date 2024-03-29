import { Component, OnInit } from '@angular/core';
import { faVirusSlash, faVirus } from '@fortawesome/free-solid-svg-icons';
import { faStar } from '@fortawesome/free-regular-svg-icons'


@Component({
  selector: 'app-user-interface',
  templateUrl: './user-interface.component.html',
  styleUrls: ['./user-interface.component.css']
})
export class UserInterfaceComponent implements OnInit {

  faVirusSlash = faVirusSlash;
  faVirus = faVirus;
  faStar = faStar;


  toiletId = '1.44';
  toiletName = 'Terminal 1 / M / Basement';
  toiletLocation = 'Helsinki-Vantaa Airport'
  timeSet: number = 0;
  interval: any;
 // halfTime: number = 30;
  color1: string = '#06E703';
  color2: string = '#ffffff';

  overTimeText: string | undefined;
  date = new Date();
  TimeNow = new Date();

  ShowHidden = false;
  ShowHiddenVirus = true;
  allowPinCode: boolean = false;

  constructor(){
    setTimeout(() => {
      this.allowPinCode = true;}, 5000);}
  



// Käynnistää timerin automatic sivun latauksesta!
  ngOnInit():void {
    this.startTimer();
 }
 OpenButton (){
  this.allowPinCode = !this.allowPinCode;
 }

// reset nappi disabloidaan painalluksen jälkeen!
actionMethod(event: any) {
event.target.disabled = true;    
  }

  // tämä näyttää viruskielletty kuvakkeen
  HiddenShowEKA() {  
    this.ShowHidden = !this.ShowHidden;
    }

    // tämä näyttää viruskuvakkeen
    HiddenShowTOKA() {  
      this.ShowHiddenVirus = !this.ShowHiddenVirus;
      }

  startTimer() {
    this.interval = setInterval(() => {
      if(this.timeSet < 24) {
        this.timeSet++;
      } else {
        //this.timeSet = 0;
        this.pauseTimer();
      }    
      if(this.timeSet > 1){
        this.color1 = '#18E703';
        this.color2 = '#ededed';
      }
      if(this.timeSet > 2){
        this.color1 = '#37E703';
        this.color2 = '#ededed';
      }
      if(this.timeSet > 3){
        this.color1 = '#59E703';
        this.color2 = '#e8e8e8';
      }
      if(this.timeSet > 4){
        this.color1 = '#8AE703';
        this.color2 = '#e8e8e8';
      }
      if(this.timeSet > 5){
        this.color1 = '#A9E703';
        this.color2 = '#e3e3e3';
      }
      if(this.timeSet > 6){
        this.color1 = '#E7E703';
        this.color2 = '#e3e3e3';
      }
      if(this.timeSet > 7){
        this.color1 = '#E7C103';
        this.color2 = '#dedede';
      }
      if(this.timeSet > 8){
        this.color1 = '#E79E03';
        this.color2 = '#dedede';   
      }
      if(this.timeSet > 9){
        this.color1 = '#E77803';
        this.color2 = '#cccccc';   

      }
      if(this.timeSet > 10){
        this.color1 = '#E75D03';
        this.color2 = '#cccccc';   
      }
      if(this.timeSet > 11){
        this.color1 = '#E73E03';
        this.color2 = '#c2c2c2';   

      }
      if(this.timeSet > 12){
        this.color1 = '#E72203';
        this.color2 = '#b0b0b0';   

      }
      if(this.timeSet == 13){
        this.overTimeText = 'Please, don´t use now this toilet area. Our cleaning team is on the way!';
        this.HiddenShowEKA();
        this.HiddenShowTOKA()
      }


    },5000) // interval 1000 = 1s, for demo 10000 per one = 10s
  }
  pauseTimer() {
    clearInterval(this.interval);
  }



  resetTimer() {
    this.timeSet = 0;
    this.color1 = '#06E703';
    this.overTimeText = '';
    this.ShowHidden = !this.ShowHidden;
    this.ShowHiddenVirus = true;
    this.color2 = '#ffffff';

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




