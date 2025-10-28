import { Injectable } from '@angular/core';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

@Injectable({
  providedIn: 'root'
})
export class TourService {
  private driverObj: any;

  constructor() {
    this.driverObj = driver({
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: 'Siguiente →',
      prevBtnText: '← Anterior',
      doneBtnText: '✓ Entendido',
      progressText: '{{current}} de {{total}}',
      popoverClass: 'driverjs-theme',
      onDestroyStarted: () => {
        this.markTourAsCompleted();
        this.driverObj.destroy();
      }
    });
  }

  startUserTour() {
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      // Tour para móviles
      this.driverObj.setConfig({
        steps: [
          {
            element: '[data-tour="menu-hamburguesa"]',
            popover: {
              title: '📋 Menú de Navegación',
              description: 'Toca aquí para abrir el menú y acceder a la sección de <strong>Boletas</strong>, donde podrás ver e imprimir todos tus documentos.',
              side: 'bottom',
              align: 'end'
            }
          },
          {
            element: '[data-tour="carrito-mobile"]',
            popover: {
              title: '🛒 Carrito de Boletas',
              description: 'Usa este botón flotante para abrir tu carrito en cualquier momento. Aquí encontrarás las boletas que selecciones para imprimir.',
              side: 'left',
              align: 'center'
            }
          }
        ]
      });
    } else {
      // Tour para desktop
      this.driverObj.setConfig({
        steps: [
          {
            element: '[data-tour="boletas-desktop"]',
            popover: {
              title: '📋 Sección de Boletas',
              description: 'Aquí puedes ver todas tus boletas disponibles e imprimirlas cuando lo necesites. Es tu principal punto de acceso a los documentos.',
              side: 'bottom',
              align: 'start'
            }
          },
          {
            element: '[data-tour="carrito-sidebar"]',
            popover: {
              title: '🛒 Carrito de Boletas',
              description: 'En este panel encontrarás las boletas que selecciones. Podrás revisarlas y proceder con la impresión.',
              side: 'left',
              align: 'start'
            }
          }
        ]
      });
    }

    this.driverObj.drive();
  }

  private markTourAsCompleted() {
    localStorage.setItem('hasSeenTour', 'true');
  }

  shouldShowTour(): boolean {
    return !localStorage.getItem('hasSeenTour');
  }

  resetTour() {
    localStorage.removeItem('hasSeenTour');
  }
}