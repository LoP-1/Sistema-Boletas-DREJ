import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../shared/navbar/navbar';
import { SideBar } from '../shared/side-bar/side-bar';

@Component({
  selector: 'app-dashboard',
  imports: [Navbar, SideBar, RouterOutlet],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
}
