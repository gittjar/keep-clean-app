import { Component,OnInit } from '@angular/core';
import { faVirusSlash, faVirus, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { Toilet } from '../models/toilet';
import { ToiletlocationService } from '../toiletlocation.service';




@Component({
  selector: 'app-keskialue',
  templateUrl: './keskialue.component.html',
  styleUrls: ['./keskialue.component.css']
})
export class KeskialueComponent implements OnInit {

  // fontawesomen icons
  faVirusSlash = faVirusSlash;
  faVirus = faVirus;
  faArrowRight = faArrowRight;

  toiletId = '1.44';
  toiletName = 'Terminal 1 / M / Basement';
  toiletLocation = 'Helsinki-Vantaa Airport'

  toilet_url: Toilet [] = [];

  timeSet: number = 0;
  interval: any;
 // halfTime: number = 30;
  color1: string = '#06E703';
  overTimeText: string | undefined;
  date = new Date();
  TimeNow = new Date();

  ShowHidden = false;
  ShowHiddenVirus = true;
  allowPinCode: boolean = false;

  // kortin alaosassa oleva määrittely true / false muuttaa väriä
  cardStatusColorGreen: string = '#06E703';
  cardStatusColorRed: string = '#E72203';


  constructor(private hpservice: ToiletlocationService){
    setTimeout(() => {
      this.allowPinCode = true;}, 5000);}
  
  ngOnInit():void {
    this.getToilet();
 }

 getToilet():void{
  this.hpservice.getToilet().subscribe(toilet_url => this.toilet_url = toilet_url);
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
      if(this.timeSet == 13){
        this.overTimeText = 'Last clean up was done, more than our service promise!';
        this.HiddenShowEKA();
        this.HiddenShowTOKA()
      }


    },2500) // interval 1000 = 1s, for demo 2500 per one = 2,5s
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
  }


  }

