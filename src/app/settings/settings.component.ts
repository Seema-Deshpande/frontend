import { Component } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  showDrawer: boolean = false;

  toggleDrawer() {
    this.showDrawer = !this.showDrawer;
  }

  closeDrawer() {
    this.showDrawer = false;
  }
}
