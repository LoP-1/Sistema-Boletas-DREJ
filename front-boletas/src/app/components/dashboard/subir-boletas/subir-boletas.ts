import { Component, ChangeDetectorRef, ChangeDetectionStrategy, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
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
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  
  boletaForm: FormGroup;
  boletasArray: BoletaDTO[] = [];
  selectedFile: File | null = null;
  loading = false;
  successMessage = '';
  errorMessage = '';
  showForm = false;

  meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  constructor(
    private fb: FormBuilder,
    private boletaService: BoletaService
  ) {
    this.boletaForm = this.createBoletaForm();
  }

  createBoletaForm(): FormGroup {
    return this.fb.group({
      archivo_origen: ['', Validators.required],
      raw_length: [0, [Validators.required, Validators.min(0)]],
      secuencia: ['', Validators.required],
      codigo_encabezado: [''],
      ruc_bloque: [''],
      mes: ['Enero', Validators.required],
      anio: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
      estado: ['Activo', Validators.required],
      apellidos: ['', Validators.required],
      nombres: ['', Validators.required],
      fecha_nacimiento: ['', Validators.required],
      documento_identidad: ['', Validators.required],
      establecimiento: ['', Validators.required],
      cargo: ['', Validators.required],
      tipo_servidor: ['', Validators.required],
      tipo_pensionista: [''],
      tipo_pension: [''],
      nivel_mag_horas: [''],
      tiempo_servicio: [''],
      leyenda_permanente: [''],
      leyenda_mensual: [''],
      fecha_ingreso_registro: ['', Validators.required],
      fecha_termino_registro: [''],
      cuenta_principal: ['', Validators.required],
      cuentas_todas: [''],
      regimen_pensionario: [''],
      total_remuneraciones: [0, [Validators.required, Validators.min(0)]],
      total_descuentos: [0, [Validators.required, Validators.min(0)]],
      total_liquido: [0, [Validators.required, Validators.min(0)]],
      monto_imponible: [0, [Validators.required, Validators.min(0)]],
      conceptos: this.fb.array([]),
      reg_pensionario_raw: [''],
      reg_pensionario_afiliacion: ['']
    });
  }

  // Helper para forzar actualización
  private forceUpdate(): void {
    this.ngZone.run(() => {
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    });
  }

  get conceptos(): FormArray {
    return this.boletaForm.get('conceptos') as FormArray;
  }

  agregarConcepto(): void {
    const conceptoGroup = this.fb.group({
      tipo: ['ingreso', Validators.required],
      concepto: ['', Validators.required],
      monto: [0, [Validators.required]]
    });
    this.conceptos.push(conceptoGroup);
    this.forceUpdate();
  }

  eliminarConcepto(index: number): void {
    this.conceptos.removeAt(index);
    this.forceUpdate();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.errorMessage = '';
      this.successMessage = '';
      this.forceUpdate();
    }
  }

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

  agregarBoletaFormulario(): void {
    if (this.boletaForm.invalid) {
      this.errorMessage = '⚠️ Por favor completa todos los campos requeridos';
      this.marcarCamposComoTocados();
      this.forceUpdate();
      return;
    }

    this.ngZone.run(() => {
      const formValue = this.boletaForm.value;
      
      const cuentasTodas = formValue.cuentas_todas 
        ? formValue.cuentas_todas.split(',').map((c: string) => c.trim())
        : [formValue.cuenta_principal];

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

      if (formValue.reg_pensionario_raw || formValue.reg_pensionario_afiliacion) {
        nuevaBoleta.reg_pensionario_detalle = {
          raw: formValue.reg_pensionario_raw,
          afiliacion: formValue.reg_pensionario_afiliacion
        };
      }

      this.boletasArray = [...this.boletasArray, nuevaBoleta];
      
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
      this.successMessage = `✅ Boleta agregada exitosamente. Total: ${this.boletasArray.length}`;
      this.showForm = false;
      this.errorMessage = '';
      
      this.forceUpdate();
    });
  }

  marcarCamposComoTocados(): void {
    Object.keys(this.boletaForm.controls).forEach(key => {
      const control = this.boletaForm.get(key);
      control?.markAsTouched();
    });
  }

  eliminarBoletaArray(index: number): void {
    this.ngZone.run(() => {
      this.boletasArray = this.boletasArray.filter((_, i) => i !== index);
      this.successMessage = `🗑️ Boleta eliminada. Total restante: ${this.boletasArray.length}`;
      this.errorMessage = '';
      this.forceUpdate();
    });
  }

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
            
            if (typeof response === 'string') {
              this.successMessage = '✅ ' + response;
            } else if (response && response.success) {
              this.successMessage = `✅ ${response.mensaje} - Total: ${response.cantidad} boleta(s)`;
            } else {
              this.successMessage = `✅ ¡Boletas guardadas correctamente! Total enviado: ${this.boletasArray.length}`;
            }
            
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

  toggleForm(): void {
    this.ngZone.run(() => {
      this.showForm = !this.showForm;
      
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

  descargarPlantilla(): void {
    const plantilla: BoletaDTO[] = [{
      archivo_origen: "20193_ben001_CL.lis",
      raw_length: 1500,
      conceptos: [
        {
          tipo: "ingreso",
          concepto: "djudicia",
          monto: 135.0
        },
        {
          tipo: "egreso",
          concepto: "AFP Horizonte",
          monto: 50.0
        }
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
    
    this.ngZone.run(() => {
      this.successMessage = '📥 Plantilla descargada correctamente';
      this.forceUpdate();
      
      setTimeout(() => {
        this.successMessage = '';
        this.forceUpdate();
      }, 3000);
    });
  }

  calcularTotalLiquido(): void {
    this.ngZone.run(() => {
      const remuneraciones = this.boletaForm.get('total_remuneraciones')?.value || 0;
      const descuentos = this.boletaForm.get('total_descuentos')?.value || 0;
      const liquido = remuneraciones - descuentos;
      this.boletaForm.patchValue({ total_liquido: liquido });
      this.forceUpdate();
    });
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const anio = date.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }
}