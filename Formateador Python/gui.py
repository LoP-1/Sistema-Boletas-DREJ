import tkinter as tk
from tkinter import filedialog, messagebox
from pathlib import Path
from logic import iter_registros, guardar_json_simple

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
    salida = filedialog.asksaveasfilename(title="Archivo de salida JSON", defaultextension=".json", filetypes=[("JSON files", "*.json")])
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
        messagebox.showinfo("Listo", f"Procesadas {total} boletas.\nArchivo: {salida}\nSin DNI: {sin_dni_out}")
    except Exception as e:
        messagebox.showerror("Error", str(e))

root = tk.Tk()
root.title("Boletas GUI")

frame = tk.Frame(root, padx=20, pady=10)
frame.pack(fill="x")

tk.Label(frame, text="Directorio raíz:").pack(anchor="w")
entry_directorio = tk.Entry(frame, width=50)
entry_directorio.pack(side="left", fill="x", expand=True)
btn_examinar = tk.Button(frame, text="Examinar...", command=seleccionar_directorio)
btn_examinar.pack(side="left", padx=5)

btn_generar = tk.Button(root, text="Generar JSON", command=generar_json, height=2)
btn_generar.pack(pady=10, fill="x", expand=True)

root.mainloop()