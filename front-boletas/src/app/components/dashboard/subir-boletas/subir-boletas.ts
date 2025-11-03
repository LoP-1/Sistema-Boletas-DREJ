import { Component, ChangeDetectorRef, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { BoletaDTO } from '../../../models/boleta.model';
import { BoletaService } from '../../../services/boleta';

@Component({
  selector: 'app-subir-boletas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './subir-boletas.html',
  styleUrls: ['./subir-boletas.css']
})
export class SubirBoletas {
  // Inyección de utilidades
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  
  // Formulario reactivo principal
  boletaForm: FormGroup;
  // Lista local de boletas que se van agregando (antes de enviar)
  boletasArray: BoletaDTO[] = [];
  // Archivo JSON seleccionado por el usuario
  selectedFile: File | null = null;
  // Flags y mensajes de estado
  loading = false;
  successMessage = '';
  errorMessage = '';
  showForm = false;

  // Lista de meses para el select
  meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  constructor(
    private fb: FormBuilder,
    private boletaService: BoletaService
  ) {
    // Crear el formulario al construir el componente
    this.boletaForm = this.createBoletaForm();
  }

  // ==================== VALIDADORES PERSONALIZADOS ====================
  // Validadores simples que retornan ValidationErrors | null

  // Validador para fechas en formato DD/MM/YYYY
  dateFormatValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null; // vacío lo maneja 'required' si aplica

    const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = control.value.match(datePattern);
    if (!match) return { invalidFormat: true };

    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);

    if (month < 1 || month > 12) return { invalidMonth: true };
    if (day < 1 || day > 31) return { invalidDay: true };
    if (year < 1900 || year > 2100) return { invalidYear: true };

    const daysInMonth = new Date(year, month, 0).getDate();
    if (day > daysInMonth) return { invalidDate: true };

    return null;
  }

  // Validador para DNI peruano (8 dígitos)
  dniValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const dniPattern = /^\d{8}$/;
    if (!dniPattern.test(control.value)) return { invalidDni: true };
    return null;
  }

  // Validador para año (4 dígitos y rango razonable)
  yearValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const year = parseInt(control.value, 10);
    const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear + 10) return { invalidYearRange: true };
    return null;
  }

  // ==================== CREACIÓN DEL FORMULARIO ====================
  // Define todos los controles y validadores iniciales
  createBoletaForm(): FormGroup {
    return this.fb.group({
      archivo_origen: ['', Validators.required],
      raw_length: [0, [Validators.required, Validators.min(0)]],
      secuencia: ['', Validators.required],
      codigo_encabezado: [''],
      ruc_bloque: [''],
      mes: ['Enero', Validators.required],
      anio: ['', [Validators.required, Validators.pattern(/^\d{4}$/), this.yearValidator.bind(this)]],
      estado: ['Activo', Validators.required],
      apellidos: ['', Validators.required],
      nombres: ['', Validators.required],
      fecha_nacimiento: ['', [Validators.required, this.dateFormatValidator.bind(this)]],
      documento_identidad: ['', [Validators.required, this.dniValidator.bind(this)]],
      establecimiento: ['', Validators.required],
      cargo: ['', Validators.required],
      tipo_servidor: ['', Validators.required],
      tipo_pensionista: [''],
      tipo_pension: [''],
      nivel_mag_horas: [''],
      tiempo_servicio: [''],
      leyenda_permanente: [''],
      leyenda_mensual: [''],
      fecha_ingreso_registro: ['', [Validators.required, this.dateFormatValidator.bind(this)]],
      fecha_termino_registro: ['', this.dateFormatValidator.bind(this)],
      cuenta_principal: ['', Validators.required],
      cuentas_todas: [''],
      regimen_pensionario: [''],
      total_remuneraciones: [0, [Validators.required, Validators.min(0)]],
      total_descuentos: [0, [Validators.required, Validators.min(0)]],
      total_liquido: [0, [Validators.required, Validators.min(0)]],
      monto_imponible: [0, [Validators.required, Validators.min(0)]],
      conceptos: this.fb.array([]), // FormArray para los conceptos (dinámico)
      reg_pensionario_raw: [''],
      reg_pensionario_afiliacion: ['', this.dateFormatValidator.bind(this)]
    });
  }

  // ==================== MENSAJES DE ERROR ====================
  // Devuelve mensajes legibles según los errores del control
  getErrorMessage(fieldName: string): string {
    const control = this.boletaForm.get(fieldName);
    if (!control || !control.errors) return '';

    if (control.errors['required']) return 'Este campo es requerido';
    if (control.errors['invalidFormat']) return 'Formato inválido. Use DD/MM/YYYY';
    if (control.errors['invalidMonth']) return 'Mes inválido (01-12)';
    if (control.errors['invalidDay']) return 'Día inválido (01-31)';
    if (control.errors['invalidYear']) return 'Año inválido (1900-2100)';
    if (control.errors['invalidDate']) return 'Fecha inválida para el mes especificado';
    if (control.errors['invalidDni']) return 'DNI debe tener 8 dígitos';
    if (control.errors['pattern']) return 'Formato inválido';
    if (control.errors['invalidYearRange']) return 'Año fuera del rango permitido';
    if (control.errors['min']) return 'El valor debe ser mayor o igual a ' + control.errors['min'].min;

    return 'Campo inválido';
  }

  // ==================== HELPERS ====================
  // Fuerza actualización de la vista usando NgZone + ChangeDetectorRef
  private forceUpdate(): void {
    this.ngZone.run(() => {
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    });
  }

  // Getter cómodo para acceder al FormArray 'conceptos'
  get conceptos(): FormArray {
    return this.boletaForm.get('conceptos') as FormArray;
  }

  // Marca todos los controles del formulario como 'touched' para mostrar errores
  marcarCamposComoTocados(): void {
    Object.keys(this.boletaForm.controls).forEach(key => {
      const control = this.boletaForm.get(key);
      control?.markAsTouched();
      
      // Si es un FormArray, marcar sus controles internos también
      if (control instanceof FormArray) {
        control.controls.forEach(c => {
          if (c instanceof FormGroup) {
            Object.keys(c.controls).forEach(subKey => {
              c.get(subKey)?.markAsTouched();
            });
          }
        });
      }
    });
    this.forceUpdate();
  }

  // ==================== MANEJO DE CONCEPTOS ====================
  // Agrega un nuevo concepto al FormArray con validaciones básicas
  agregarConcepto(): void {
    const conceptoGroup = this.fb.group({
      tipo: ['ingreso', Validators.required],
      concepto: ['', Validators.required],
      monto: [0, [Validators.required, Validators.min(0)]]
    });
    this.conceptos.push(conceptoGroup);
    this.forceUpdate();
  }

  // Elimina concepto por índice
  eliminarConcepto(index: number): void {
    this.conceptos.removeAt(index);
    this.forceUpdate();
  }

  // ==================== CARGA DE ARCHIVOS ====================
  // Maneja la selección del archivo desde el input type="file"
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.errorMessage = '';
      this.successMessage = '';
      this.forceUpdate();
    }
  }

  // Lee y parsea el JSON seleccionado; llena boletasArray con el contenido
  cargarJson(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Por favor selecciona un archivo JSON';
      this.forceUpdate();
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      this.ngZone.run(() => {
        try {
          const content = e.target?.result as string;
          const jsonData = JSON.parse(content);

          // Si el JSON es un array, usarlo tal cual; si es un objeto, convertirlo en array
          if (Array.isArray(jsonData)) {
            this.boletasArray = [...jsonData];
          } else {
            this.boletasArray = [jsonData];
          }

          this.successMessage = `✅ JSON cargado correctamente. ${this.boletasArray.length} boleta(s) detectada(s)`;
          this.errorMessage = '';
          this.forceUpdate();
        } catch (error) {
          this.errorMessage = '❌ Error al parsear el archivo JSON. Verifica el formato.';
          this.successMessage = '';
          this.forceUpdate();
          console.error(error);
        }
      });
    };
    reader.readAsText(this.selectedFile);
  }

  // ==================== AGREGAR BOLETA DESDE FORMULARIO ====================
  agregarBoletaFormulario(): void {
    // Mostrar validaciones
    this.marcarCamposComoTocados();

    if (this.boletaForm.invalid) {
      this.errorMessage = '⚠️ Por favor completa todos los campos requeridos correctamente';
      this.forceUpdate();

      // Scroll al primer campo con borde rojo (primer error)
      setTimeout(() => {
        const firstError = document.querySelector('.border-red-500');
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);

      return;
    }

    this.ngZone.run(() => {
      const formValue = this.boletaForm.value;

      // Procesar cuentas_todas: si se especificó, convertir a array; si no, usar cuenta_principal
      const cuentasTodas = formValue.cuentas_todas 
        ? formValue.cuentas_todas.split(',').map((c: string) => c.trim())
        : [formValue.cuenta_principal];

      // Construir objeto BoletaDTO a partir de los valores del formulario
      const nuevaBoleta: BoletaDTO = {
        archivo_origen: formValue.archivo_origen,
        raw_length: formValue.raw_length,
        conceptos: formValue.conceptos || [],
        secuencia: formValue.secuencia,
        codigo_encabezado: formValue.codigo_encabezado,
        ruc_bloque: formValue.ruc_bloque,
        mes: formValue.mes,
        anio: formValue.anio,
        estado: formValue.estado,
        apellidos: formValue.apellidos,
        nombres: formValue.nombres,
        fecha_nacimiento: formValue.fecha_nacimiento,
        documento_identidad: formValue.documento_identidad,
        establecimiento: formValue.establecimiento,
        cargo: formValue.cargo,
        tipo_servidor: formValue.tipo_servidor,
        tipo_pensionista: formValue.tipo_pensionista,
        tipo_pension: formValue.tipo_pension,
        nivel_mag_horas: formValue.nivel_mag_horas,
        tiempo_servicio: formValue.tiempo_servicio,
        leyenda_permanente: formValue.leyenda_permanente,
        leyenda_mensual: formValue.leyenda_mensual,
        fecha_ingreso_registro: formValue.fecha_ingreso_registro,
        fecha_termino_registro: formValue.fecha_termino_registro,
        cuenta_principal: formValue.cuenta_principal,
        cuentas_todas: cuentasTodas,
        regimen_pensionario: formValue.regimen_pensionario,
        total_remuneraciones: formValue.total_remuneraciones,
        total_descuentos: formValue.total_descuentos,
        total_liquido: formValue.total_liquido,
        monto_imponible: formValue.monto_imponible
      };

      // Si hay detalle de régimen pensionario, adjuntarlo
      if (formValue.reg_pensionario_raw || formValue.reg_pensionario_afiliacion) {
        nuevaBoleta.reg_pensionario_detalle = {
          raw: formValue.reg_pensionario_raw,
          afiliacion: formValue.reg_pensionario_afiliacion
        };
      }

      // Agregar la boleta a la lista local
      this.boletasArray = [...this.boletasArray, nuevaBoleta];

      // Reset parcial del formulario a valores por defecto
      this.boletaForm.reset({
        mes: 'Enero',
        estado: 'Activo',
        total_remuneraciones: 0,
        total_descuentos: 0,
        total_liquido: 0,
        monto_imponible: 0,
        raw_length: 0
      });

      // Vaciar conceptos y mostrar mensaje de éxito
      this.conceptos.clear();
      this.successMessage = `✅ Boleta agregada exitosamente. Total: ${this.boletasArray.length}`;
      this.showForm = false;
      this.errorMessage = '';
      this.forceUpdate();
    });
  }

  // ==================== ELIMINAR BOLETA ====================
  // Elimina una boleta del array local por índice
  eliminarBoletaArray(index: number): void {
    this.ngZone.run(() => {
      this.boletasArray = this.boletasArray.filter((_, i) => i !== index);
      this.successMessage = `🗑️ Boleta eliminada. Total restante: ${this.boletasArray.length}`;
      this.errorMessage = '';
      this.forceUpdate();
    });
  }

  // ==================== ENVIAR BOLETAS ====================
  // Envia boletasArray al servicio boletaService.subirBoletasJson
  enviarBoletas(): void {
    if (this.boletasArray.length === 0) {
      this.errorMessage = '⚠️ No hay boletas para enviar';
      this.forceUpdate();
      return;
    }

    this.ngZone.run(() => {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';
      this.forceUpdate();

      console.log('📤 Enviando boletas:', this.boletasArray);

      this.boletaService.subirBoletasJson(this.boletasArray).subscribe({
        next: (response: any) => {
          this.ngZone.run(() => {
            this.loading = false;
            console.log('✅ Respuesta del servidor:', response);

            // Interpretación simple de la respuesta para generar successMessage
            if (typeof response === 'string') {
              this.successMessage = '✅ ' + response;
            } else if (response && response.success) {
              this.successMessage = `✅ ${response.mensaje} - Total: ${response.cantidad} boleta(s)`;
            } else {
              this.successMessage = `✅ ¡Boletas guardadas correctamente! Total enviado: ${this.boletasArray.length}`;
            }

            // Limpiar estado local tras éxito
            this.boletasArray = [];
            this.selectedFile = null;
            this.errorMessage = '';
            this.forceUpdate();
          });
        },
        error: (error) => {
          this.ngZone.run(() => {
            this.loading = false;
            console.error('❌ Error completo:', error);

            // Algunos servidores devuelven status=200 pero van por el path de error; se maneja ese caso
            if (error.status === 200) {
              this.successMessage = `✅ ¡Boletas guardadas correctamente! Total enviado: ${this.boletasArray.length}`;
              this.boletasArray = [];
              this.selectedFile = null;
              this.errorMessage = '';
            } else {
              this.errorMessage = '❌ Error al enviar las boletas: ' + (error.error?.mensaje || error.message);
              this.successMessage = '';
            }

            this.forceUpdate();
          });
        }
      });
    });
  }

  // ==================== LIMPIAR TODO ====================
  limpiarTodo(): void {
    this.ngZone.run(() => {
      this.boletasArray = [];
      this.selectedFile = null;
      this.boletaForm.reset({
        mes: 'Enero',
        estado: 'Activo',
        total_remuneraciones: 0,
        total_descuentos: 0,
        total_liquido: 0,
        monto_imponible: 0,
        raw_length: 0
      });
      this.conceptos.clear();
      this.successMessage = '🧹 Todo limpiado correctamente';
      this.errorMessage = '';
      this.showForm = false;
      this.forceUpdate();
    });
  }

  // ==================== TOGGLE FORMULARIO ====================
  toggleForm(): void {
    this.ngZone.run(() => {
      this.showForm = !this.showForm;

      // Si se oculta el formulario, resetear valores y limpiar conceptos
      if (!this.showForm) {
        this.boletaForm.reset({
          mes: 'Enero',
          estado: 'Activo',
          total_remuneraciones: 0,
          total_descuentos: 0,
          total_liquido: 0,
          monto_imponible: 0,
          raw_length: 0
        });
        this.conceptos.clear();
        this.errorMessage = '';
      }

      this.forceUpdate();
    });
  }

  // ==================== DESCARGAR PLANTILLA ====================
  // Genera y descarga un archivo JSON con un ejemplo de boleta
  descargarPlantilla(): void {
    const plantilla: BoletaDTO[] = [{
      archivo_origen: "20193_ben001_CL.lis",
      raw_length: 1500,
      conceptos: [
        { tipo: "ingreso", concepto: "djudicia", monto: 135.0 },
        { tipo: "egreso", concepto: "AFP Horizonte", monto: 50.0 }
      ],
      secuencia: "00000051",
      codigo_encabezado: "CL157710",
      mes: "Enero",
      anio: "2008",
      estado: "Activo",
      apellidos: "ACOSTA RAMOS",
      nombres: "FLOR CLELIA",
      fecha_nacimiento: "29/01/1970",
      documento_identidad: "20091425",
      establecimiento: "CEA. \"JORGE BASADRE\" - LA LIBERTAD",
      cargo: "AUX. EDUCAC.",
      tipo_servidor: "AUXILIAR EDUCACION NOMBRADO",
      tipo_pensionista: "",
      tipo_pension: "",
      nivel_mag_horas: "E/00- /30",
      tiempo_servicio: "10-00-00",
      leyenda_permanente: ".",
      leyenda_mensual: "",
      fecha_ingreso_registro: "15/09/2007",
      fecha_termino_registro: "15/09/2007",
      cuenta_principal: "CTA- 4381221402",
      cuentas_todas: ["CTA- 4381221402"],
      reg_pensionario_detalle: {
        raw: "AFP Horizont/521111SOCOT6 CFija      :      0.00 FAfiliacion  : 15/09/2000 CVariable  :      0.00 FDevengue    : 15/09/2000 Seguro     :      0.00",
        afiliacion: "15/09/2000"
      },
      regimen_pensionario: "AFP",
      total_remuneraciones: 135.0,
      total_descuentos: 0.0,
      total_liquido: 135.0,
      monto_imponible: 0.0
    }];

    const dataStr = JSON.stringify(plantilla, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'plantilla-boletas.json';
    link.click();
    window.URL.revokeObjectURL(url);

    // Mensaje de éxito temporal
    this.ngZone.run(() => {
      this.successMessage = '📥 Plantilla descargada correctamente';
      this.forceUpdate();

      setTimeout(() => {
        this.successMessage = '';
        this.forceUpdate();
      }, 3000);
    });
  }

  // ==================== CALCULAR TOTAL LÍQUIDO ====================
  // Calcula total_liquido = total_remuneraciones - total_descuentos y lo parchea en el formulario
  calcularTotalLiquido(): void {
    this.ngZone.run(() => {
      const remuneraciones = this.boletaForm.get('total_remuneraciones')?.value || 0;
      const descuentos = this.boletaForm.get('total_descuentos')?.value || 0;
      const liquido = remuneraciones - descuentos;
      this.boletaForm.patchValue({ total_liquido: liquido });
      this.forceUpdate();
    });
  }

  // ==================== FORMATEAR FECHA (UTILIDAD) ====================
  // Convierte una fecha JS a formato DD/MM/YYYY (si se necesitara)
  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const anio = date.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }
}