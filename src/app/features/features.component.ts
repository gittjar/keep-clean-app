import { Component } from '@angular/core';
import { faHeart, faClipboard, faClock, faFaceSmileBeam } from '@fortawesome/free-regular-svg-icons';
import { faListCheck, faLayerGroup, faUsersSlash, faCode } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-features',
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.css']
})
export class FeaturesComponent {
  faHeart = faHeart;
  faListCheck = faListCheck;
  faClipboard = faClipboard;
  faClock = faClock;
  faLayerGroup = faLayerGroup;
  faUsersSlash = faUsersSlash;
  faFaceSmileBeam = faFaceSmileBeam;
  faCode = faCode;
}
