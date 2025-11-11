import tkinter as tk
from tkinter import ttk, filedialog, messagebox
from pathlib import Path
from logic import iter_registros, guardar_json_simple

# Colores del tema moderno
COLORS = {
    'bg_primary': '#1e1e2e',
    'bg_secondary': '#2a2a3e',
    'bg_tertiary': '#363649',
    'accent': '#7c3aed',
    'accent_hover': '#6d28d9',
    'text': '#e0e0e0',
    'text_secondary': '#a0a0a0',
    'success': '#10b981',
    'error': '#ef4444',
    'border': '#4a4a5e'
}

def centrar_ventana(root, ancho=700, alto=700):
    root.update_idletasks()
    pantalla_w = root.winfo_screenwidth()
    pantalla_h = root.winfo_screenheight()
    x = (pantalla_w // 2) - (ancho // 2)
    y = (pantalla_h // 2) - (alto // 2)
    root.geometry(f"{ancho}x{alto}+{x}+{y}")
    root.minsize(ancho, alto)

class ModernButton(tk.Canvas):
    def __init__(self, parent, text, command, color=COLORS['accent'], **kwargs):
        super().__init__(parent, height=45, highlightthickness=0, **kwargs)
        self.command = command
        self.text = text
        self.color = color
        self.hover_color = COLORS['accent_hover']
        self.is_hover = False
        
        self.bind('<Enter>', self.on_enter)
        self.bind('<Leave>', self.on_leave)
        self.bind('<Button-1>', self.on_click)
        
        self.draw()
    
    def draw(self):
        self.delete('all')
        color = self.hover_color if self.is_hover else self.color
        width = self.winfo_width() if self.winfo_width() > 1 else 300
        
        # Fondo con bordes redondeados
        self.create_rounded_rect(2, 2, width-2, 43, radius=8, fill=color, outline='')
        
        # Texto
        self.create_text(width//2, 22, text=self.text, fill=COLORS['text'], 
                        font=('Segoe UI', 11, 'bold'))
    
    def create_rounded_rect(self, x1, y1, x2, y2, radius=25, **kwargs):
        points = [
            x1+radius, y1, x1+radius, y1,
            x2-radius, y1, x2-radius, y1,
            x2, y1, x2, y1+radius,
            x2, y1+radius, x2, y2-radius,
            x2, y2-radius, x2, y2,
            x2-radius, y2, x2-radius, y2,
            x1+radius, y2, x1+radius, y2,
            x1, y2, x1, y2-radius,
            x1, y2-radius, x1, y1+radius,
            x1, y1+radius, x1, y1
        ]
        return self.create_polygon(points, smooth=True, **kwargs)
    
    def on_enter(self, e):
        self.is_hover = True
        self.draw()
        self.configure(cursor='hand2')
    
    def on_leave(self, e):
        self.is_hover = False
        self.draw()
        self.configure(cursor='')
    
    def on_click(self, e):
        if self.command:
            self.command()
    
    def redraw(self, e=None):
        self.draw()

class ModernEntry(tk.Frame):
    def __init__(self, parent, placeholder="", **kwargs):
        super().__init__(parent, bg=COLORS['bg_secondary'])
        
        self.entry = tk.Entry(
            self, 
            font=('Segoe UI', 10),
            bg=COLORS['bg_tertiary'],
            fg=COLORS['text'],
            insertbackground=COLORS['text'],
            relief='flat',
            bd=0,
            **kwargs
        )
        self.entry.pack(fill='both', expand=True, padx=2, pady=2)
    
    def get(self):
        return self.entry.get()
    
    def delete(self, first, last):
        self.entry.delete(first, last)
    
    def insert(self, index, string):
        self.entry.insert(index, string)

class ProgressBar(tk.Canvas):
    def __init__(self, parent, **kwargs):
        super().__init__(parent, height=6, highlightthickness=0, bg=COLORS['bg_tertiary'], **kwargs)
        self.progress = 0
        
    def set_progress(self, value):
        self.progress = max(0, min(100, value))
        self.draw()
    
    def draw(self):
        self.delete('all')
        width = self.winfo_width()
        if width > 1:
            # Barra de fondo
            self.create_rectangle(0, 0, width, 6, fill=COLORS['bg_tertiary'], outline='')
            # Barra de progreso
            prog_width = (width * self.progress) / 100
            self.create_rectangle(0, 0, prog_width, 6, fill=COLORS['accent'], outline='')

def seleccionar_directorio():
    carpeta = filedialog.askdirectory(title="Selecciona el directorio raíz con archivos")
    if carpeta:
        entry_directorio.delete(0, tk.END)
        entry_directorio.insert(0, carpeta)
        lbl_status.config(text=f"Directorio seleccionado: {Path(carpeta).name}")

def generar_json():
    directorio = entry_directorio.get()
    if not directorio or not Path(directorio).exists():
        messagebox.showerror("Error", "Selecciona un directorio válido.")
        return
    
    salida = filedialog.asksaveasfilename(
        title="Archivo de salida JSON",
        defaultextension=".json",
        filetypes=[("JSON files", "*.json")]
    )
    if not salida:
        return
    
    sin_dni_out = salida.replace('.json', '_sin_dni.json')
    
    try:
        lbl_status.config(text="Procesando archivos...", fg=COLORS['text_secondary'])
        progress.set_progress(30)
        root.update()
        
        total = guardar_json_simple(
            iter_registros(Path(directorio)),
            Path(salida),
            skip_errors=True,
            sin_dni_path=Path(sin_dni_out)
        )
        
        progress.set_progress(100)
        lbl_status.config(text=f"¡Completado! {total} boletas procesadas", fg=COLORS['success'])
        
        messagebox.showinfo(
            "Proceso Exitoso",
            f"¡Listo!\n\n"
            f"► Procesadas: {total} boletas\n"
            f"► Archivo principal: {Path(salida).name}\n"
            f"► Sin DNI: {Path(sin_dni_out).name}"
        )
        progress.set_progress(0)
        
    except Exception as e:
        progress.set_progress(0)
        lbl_status.config(text="Error en el procesamiento", fg=COLORS['error'])
        messagebox.showerror("Error", f"Error:\n\n{str(e)}")

# Configuración de la ventana principal
root = tk.Tk()
root.title("Exportador de Boletas • JSON")
root.configure(bg=COLORS['bg_primary'])
centrar_ventana(root, ancho=700, alto=700)

# Intentar mejorar DPI awareness en Windows
try:
    from ctypes import windll
    windll.shcore.SetProcessDpiAwareness(1)
except:
    pass

# ===== HEADER =====
header = tk.Frame(root, bg=COLORS['bg_secondary'], height=80)
header.pack(fill='x', padx=0, pady=0)
header.pack_propagate(False)

title_label = tk.Label(
    header,
    text="📊 Exportador de Boletas",
    font=('Segoe UI', 20, 'bold'),
    bg=COLORS['bg_secondary'],
    fg=COLORS['text']
)
title_label.pack(pady=(20, 5))

subtitle_label = tk.Label(
    header,
    text="Convierte archivos .lis, .lit y .txt a formato JSON",
    font=('Segoe UI', 9),
    bg=COLORS['bg_secondary'],
    fg=COLORS['text_secondary']
)
subtitle_label.pack()

# ===== CONTENIDO PRINCIPAL =====
main_frame = tk.Frame(root, bg=COLORS['bg_primary'])
main_frame.pack(fill='both', expand=True, padx=30, pady=20)

# Card para selección de directorio
card_dir = tk.Frame(main_frame, bg=COLORS['bg_secondary'], relief='flat')
card_dir.pack(fill='x', pady=(0, 15))

card_inner = tk.Frame(card_dir, bg=COLORS['bg_secondary'])
card_inner.pack(fill='x', padx=20, pady=20)

lbl_dir = tk.Label(
    card_inner,
    text="📁 Directorio de origen",
    font=('Segoe UI', 11, 'bold'),
    bg=COLORS['bg_secondary'],
    fg=COLORS['text'],
    anchor='w'
)
lbl_dir.pack(fill='x', pady=(0, 10))

entry_frame = tk.Frame(card_inner, bg=COLORS['bg_secondary'])
entry_frame.pack(fill='x')

entry_directorio = ModernEntry(entry_frame, width=50)
entry_directorio.pack(side='left', fill='x', expand=True, padx=(0, 10))

btn_examinar = ModernButton(
    entry_frame,
    text="Examinar",
    command=seleccionar_directorio,
    width=120
)
btn_examinar.pack(side='right')
btn_examinar.bind('<Configure>', btn_examinar.redraw)

# Card de información
card_info = tk.Frame(main_frame, bg=COLORS['bg_secondary'])
card_info.pack(fill='x', pady=(0, 15))

info_inner = tk.Frame(card_info, bg=COLORS['bg_secondary'])
info_inner.pack(fill='x', padx=20, pady=15)

info_items = [
    ("✓", "Archivos soportados: .lis, .lit, .txt"),
    ("✓", "Extracción automática de DNI y datos personales"),
    ("✓", "Separación de registros sin DNI"),
    ("✓", "Detección de errores y registro de logs")
]

for icon, text in info_items:
    item_frame = tk.Frame(info_inner, bg=COLORS['bg_secondary'])
    item_frame.pack(fill='x', pady=3)
    
    tk.Label(
        item_frame,
        text=icon,
        font=('Segoe UI', 10),
        bg=COLORS['bg_secondary'],
        fg=COLORS['success'],
        width=3,
        anchor='w'
    ).pack(side='left')
    
    tk.Label(
        item_frame,
        text=text,
        font=('Segoe UI', 9),
        bg=COLORS['bg_secondary'],
        fg=COLORS['text_secondary'],
        anchor='w'
    ).pack(side='left', fill='x')

# Barra de progreso
progress = ProgressBar(main_frame)
progress.pack(fill='x', pady=(0, 10))
progress.bind('<Configure>', lambda e: progress.draw())

# Label de estado
lbl_status = tk.Label(
    main_frame,
    text="Listo para procesar archivos",
    font=('Segoe UI', 9),
    bg=COLORS['bg_primary'],
    fg=COLORS['text_secondary'],
    anchor='w'
)
lbl_status.pack(fill='x', pady=(0, 20))

# ===== BOTONES DE ACCIÓN =====
btn_frame = tk.Frame(main_frame, bg=COLORS['bg_primary'])
btn_frame.pack(fill='x')

btn_generar = ModernButton(
    btn_frame,
    text="🚀 Generar JSON",
    command=generar_json,
    color=COLORS['accent']
)
btn_generar.pack(fill='x', pady=(0, 10))
btn_generar.bind('<Configure>', btn_generar.redraw)

btn_salir = ModernButton(
    btn_frame,
    text="Cerrar",
    command=root.destroy,
    color=COLORS['bg_tertiary']
)
btn_salir.pack(fill='x')
btn_salir.bind('<Configure>', btn_salir.redraw)

# ===== FOOTER =====
footer = tk.Frame(root, bg=COLORS['bg_secondary'], height=30)
footer.pack(fill='x', side='bottom')
footer.pack_propagate(False)

footer_label = tk.Label(
    footer,
    text="2025",
    font=('Segoe UI', 8),
    bg=COLORS['bg_secondary'],
    fg=COLORS['text_secondary']
)
footer_label.pack(expand=True)

root.mainloop()