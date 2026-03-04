import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToiletService, Toilet } from '../services/toilet.service';

@Component({
  standalone: false,
  selector: 'app-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.css']
})
export class DisplayComponent implements OnInit, OnDestroy {
  toilet: Toilet | null = null;
  loading = true;
  errorMsg = '';
  interval: any;
  clockInterval: any;
  TimeNow = new Date();

  // Timer-tila
  elapsedHours = 0;
  color1 = '#06E703';
  color2 = '#ffffff';
  overTimeText = '';
  showWarning = false;

  // PIN-resetointi
  showPinModal = false;
  pinUsername = '';
  pinCode = '';
  pinError = '';
  pinSuccess = '';
  pinLoading = false;

  constructor(
    private route: ActivatedRoute,
    private toiletService: ToiletService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadToilet(id);
    this.clockInterval = setInterval(() => { this.TimeNow = new Date(); }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
    clearInterval(this.clockInterval);
  }

  loadToilet(id: string) {
    this.toiletService.getToiletPublic(id).subscribe({
      next: (toilet) => {
        this.toilet = toilet;
        this.updateTimer();
        this.interval = setInterval(() => this.updateTimer(), 60000);
        this.loading = false;
      },
      error: () => { this.errorMsg = 'Tietoja ei saatu'; this.loading = false; }
    });
  }

  updateTimer() {
    if (!this.toilet) return;
    this.elapsedHours = this.toiletService.getElapsedHours(this.toilet.lastCleaned);
    this.updateColors();
  }

  updateColors() {
    const h = this.elapsedHours;
    this.overTimeText = '';
    this.showWarning = false;

    if (h < 1)       { this.color1 = '#06E703'; this.color2 = '#ffffff'; }
    else if (h < 2)  { this.color1 = '#37E703'; this.color2 = '#ededed'; }
    else if (h < 3)  { this.color1 = '#59E703'; this.color2 = '#e8e8e8'; }
    else if (h < 4)  { this.color1 = '#8AE703'; this.color2 = '#e8e8e8'; }
    else if (h < 5)  { this.color1 = '#A9E703'; this.color2 = '#e3e3e3'; }
    else if (h < 6)  { this.color1 = '#E7E703'; this.color2 = '#e3e3e3'; }
    else if (h < 7)  { this.color1 = '#E7C103'; this.color2 = '#dedede'; }
    else if (h < 8)  { this.color1 = '#E79E03'; this.color2 = '#dedede'; }
    else if (h < 9)  { this.color1 = '#E77803'; this.color2 = '#cccccc'; }
    else if (h < 10) { this.color1 = '#E75D03'; this.color2 = '#cccccc'; }
    else if (h < 11) { this.color1 = '#E73E03'; this.color2 = '#c2c2c2'; }
    else if (h < 12) { this.color1 = '#E72203'; this.color2 = '#b0b0b0'; }
    else {
      this.color1 = '#E72203'; this.color2 = '#b0b0b0';
      this.showWarning = true;
      this.overTimeText = 'Please do not use this toilet area. Our cleaning team is on the way!';
    }
  }

  get statusLabel(): string {
    const h = this.elapsedHours;
    if (h < 4) return 'Excellent';
    if (h < 7) return 'Good';
    if (h < 10) return 'Fair';
    return 'Needs Cleaning';
  }

  get elapsedDisplay(): string {
    if (!this.toilet) return '';
    return this.toiletService.formatElapsed(this.toilet.lastCleaned);
  }

  openPinModal() {
    this.showPinModal = true;
    this.pinCode = '';
    this.pinUsername = '';
    this.pinError = '';
    this.pinSuccess = '';
  }

  closePinModal() {
    this.showPinModal = false;
  }

  submitPin() {
    if (!this.toilet || !this.pinUsername || this.pinCode.length < 4) return;
    this.pinLoading = true;
    this.pinError = '';
    this.toiletService.pinReset(this.toilet._id, this.pinUsername, this.pinCode).subscribe({
      next: (res) => {
        if (this.toilet) this.toilet.lastCleaned = res.lastCleaned;
        this.updateTimer();
        this.pinSuccess = 'Timer nollattu!';
        this.pinLoading = false;
        setTimeout(() => { this.showPinModal = false; this.pinSuccess = ''; }, 1500);
      },
      error: (err) => {
        this.pinError = err.error?.message || 'Virheellinen PIN';
        this.pinLoading = false;
      }
    });
  }
}
