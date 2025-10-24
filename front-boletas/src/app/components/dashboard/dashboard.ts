import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../shared/navbar/navbar';
import { SideBar } from '../shared/side-bar/side-bar';
import { Footer } from "../shared/footer/footer";
import { CommonModule } from '@angular/common';
import { Carrito } from '../../services/carrito';

@Component({
  selector: 'app-dashboard',
  imports: [Navbar, SideBar, RouterOutlet, Footer, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  sidebarOpen = false;
  carritoCount = 0;

  constructor(private carritoService: Carrito) {}

  ngOnInit() {
    this.carritoService.carrito$.subscribe(carrito => {
      this.carritoCount = carrito?.length || 0;
    });
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  
}