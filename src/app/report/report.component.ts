
import { Component, OnInit } from '@angular/core';



@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {
 
  kiitosMessage = '> Your report has been send! Thank You.';
  kiitosMessageStatus = '';
  lastReportSend = '';
  TimeNow = new Date();
  timeStamps = new Date(); // joka päivittyy per click
  timeStampBlank = '';
  timeStampText = 'Last report has send: ';
  isShowDiv = true;
  clicked = false;
  date = new Date();

  
  
  


  constructor(){}

  ngOnInit(): void {
  }








  togDisplay() {  
    this.isShowDiv = !this.isShowDiv; 
    }

    // report nappi disabloidaan painalluksen jälkeen!
    actionMethod(event: any) {
      event.target.disabled = true;
      
  }


  onSubmitReport () {
    this.kiitosMessageStatus = this.kiitosMessage;
    this.timeStamps = (new Date());
    this.timeStampBlank = this.timeStampText;
  }
}
