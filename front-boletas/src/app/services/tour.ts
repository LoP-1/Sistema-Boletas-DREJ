import { Injectable } from '@angular/core';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

@Injectable({
  providedIn: 'root'
})
export class TourService {
  // Instancia interna de driver.js
  private driverObj: any;

  constructor() {
    // Configuración inicial del driver (texto de botones, estilo y callback)
    this.driverObj = driver({
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: 'Siguiente →',
      prevBtnText: '← Anterior',
      doneBtnText: '✓ Entendido',
      progressText: '{{current}} de {{total}}',
      popoverClass: 'driverjs-theme',
      // Cuando el tour comienza a destruirse, marcamos como completado.
      // NOTA: no llamar a destroy() aquí porque este callback puede ser llamado
      // por el propio driver durante su ciclo de vida y provocar doble destrucción.
      onDestroyStarted: () => {
        this.markTourAsCompleted();
      }
    });
  }

  // Inicia el tour adaptado a móvil o escritorio según el ancho de ventana
  startUserTour() {
    // No iniciar si ya se marcó como visto
    if (!this.shouldShowTour()) {
      return;
    }

    // Marcar inmediatamente para evitar que un F5 vuelva a mostrar el tour mientras el usuario lo ve.
    // Si prefieres esperar hasta que el usuario complete/ cierre el tour, puedes eliminar esta línea
    // y enganchar un callback más específico del driver al evento 'done' o 'destroy' si existe.
    this.markTourAsCompleted();

    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      this.driverObj.setConfig({
        steps: [
          {
            element: '[data-tour="menu-hamburguesa"]',
            popover: {
              title: '📋 Menú de Navegación',
              description:
                'Toca aquí para abrir el menú y acceder a la sección de <strong>Boletas</strong>, donde podrás ver e imprimir todos tus documentos.',
              side: 'bottom',
              align: 'end'
            }
          },
          {
            element: '[data-tour="carrito-mobile"]',
            popover: {
              title: '🛒 Carrito de Boletas',
              description:
                'Usa este botón flotante para abrir tu carrito en cualquier momento. Aquí encontrarás las boletas que selecciones para imprimir.',
              side: 'left',
              align: 'center'
            }
          }
        ]
      });
    } else {
      this.driverObj.setConfig({
        steps: [
          {
            element: '[data-tour="boletas-desktop"]',
            popover: {
              title: '📋 Sección de Boletas',
              description:
                'Aquí puedes ver todas tus boletas disponibles e imprimirlas cuando lo necesites. Es tu principal punto de acceso a los documentos.',
              side: 'bottom',
              align: 'start'
            }
          },
          {
            element: '[data-tour="carrito-sidebar"]',
            popover: {
              title: '🛒 Carrito de Boletas',
              description:
                'En este panel encontrarás las boletas que selecciones. Podrás revisarlas y proceder con la impresión.',
              side: 'left',
              align: 'start'
            }
          }
        ]
      });
    }

    // Lanza el tour con la configuración definida
    this.driverObj.drive();
  }

  // Marca en localStorage que el usuario ya vio el tour
  private markTourAsCompleted() {
    localStorage.setItem('hasSeenTour', 'true');
  }

  // Determina si se debe mostrar el tour (si no está marcado como visto)
  shouldShowTour(): boolean {
    return !localStorage.getItem('hasSeenTour');
  }

  // Resetea el flag para volver a mostrar el tour
  resetTour() {
    localStorage.removeItem('hasSeenTour');
  }
}