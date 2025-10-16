import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../shared/navbar/navbar';
import { SideBar } from '../shared/side-bar/side-bar';
import { Footer } from "../shared/footer/footer";

@Component({
  selector: 'app-dashboard',
  imports: [Navbar, SideBar, RouterOutlet, Footer],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
}
