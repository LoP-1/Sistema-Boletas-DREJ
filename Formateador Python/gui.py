import tkinter as tk
from tkinter import ttk, filedialog, messagebox
from pathlib import Path
from logic import iter_registros, guardar_json_simple

def centrar_ventana(root, ancho=500, alto=200):
    root.update_idletasks()
    w = ancho
    h = alto
    pantalla_w = root.winfo_screenwidth()
    pantalla_h = root.winfo_screenheight()
    x = (pantalla_w // 2) - (w // 2)
    y = (pantalla_h // 2) - (h // 2)
    root.geometry(f"{w}x{h}+{x}+{y}")
    root.minsize(w, h)

def seleccionar_directorio():
    carpeta = filedialog.askdirectory(title="Selecciona el directorio raíz con .lis")
    if carpeta:
        entry_directorio.delete(0, tk.END)
        entry_directorio.insert(0, carpeta)

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
        total = guardar_json_simple(
            iter_registros(Path(directorio)),
            Path(salida),
            skip_errors=True,
            sin_dni_path=Path(sin_dni_out)
        )
        messagebox.showinfo(
            "Listo",
            f"Procesadas {total} boletas.\nArchivo: {salida}\nSin DNI: {sin_dni_out}"
        )
    except Exception as e:
        messagebox.showerror("Error", str(e))

root = tk.Tk()
root.title("Exportador de Boletas a JSON")
centrar_ventana(root, ancho=540, alto=180)

# Estilo ttk
try:
    from ctypes import windll
    windll.shcore.SetProcessDpiAwareness(1)
except Exception:
    pass
style = ttk.Style()
style.theme_use('clam')

frame = ttk.Frame(root, padding=(20, 15))
frame.pack(fill="both", expand=True)

lbl_dir = ttk.Label(frame, text="Directorio raíz:")
lbl_dir.grid(row=0, column=0, sticky="w", pady=5, padx=(0,8))

entry_directorio = ttk.Entry(frame, width=50)
entry_directorio.grid(row=0, column=1, sticky="ew", padx=(0,8))
frame.columnconfigure(1, weight=1)

btn_examinar = ttk.Button(frame, text="Examinar...", command=seleccionar_directorio)
btn_examinar.grid(row=0, column=2, padx=(0,8))

btn_generar = ttk.Button(root, text="Generar JSON", command=generar_json)
btn_generar.pack(pady=(0,8), fill="x", expand=True)

btn_salir = ttk.Button(root, text="Cerrar", command=root.destroy)
btn_salir.pack(pady=(0,8), fill="x", expand=True)

root.mainloop()